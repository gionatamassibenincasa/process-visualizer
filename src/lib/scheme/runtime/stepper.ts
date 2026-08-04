// file: stepper.ts
import {
    ApplicazioneAST,
    AtomoAST,
    CondAST,
    DefineAST,
    IfAST,
    LambdaAST,
    ListaAST,
    NodoAST,
    ProgrammaAST,
} from '../ast/ast';
import { parseProgrammaDaSorgente } from '../ast/parser';
import { Ambiente } from './ambiente';
import type { Chiusura, FunzionePrimitiva, ValoreScheme } from './valori';

export interface PassoStepping {
    astPrecedente: NodoAST;
    astSuccessivo: NodoAST;
    regolaApplicata: string;
    èTerminato: boolean;
}

export class StepperScheme {
    private env: Ambiente<ValoreScheme>;

    constructor(env?: Ambiente<ValoreScheme>) {
        this.env = env || new Ambiente<ValoreScheme>();
    }

    /**
     * Ritorna l'ambiente corrente dello stepper.
     */
    getAmbiente(): Ambiente<ValoreScheme> {
        return this.env;
    }

    private èChiusura(valore: ValoreScheme): valore is Chiusura {
        return (
            typeof valore === 'object' &&
            valore !== null &&
            Array.isArray((valore as Chiusura).parametri) &&
            Array.isArray((valore as Chiusura).corpo)
        );
    }

    private creaChiusuraDaLambda(lambda: LambdaAST, env: Ambiente<ValoreScheme>): Chiusura {
        return {
            parametri: lambda.parametri.map(param => String(param.valore)),
            corpo: lambda.corpo,
            ambienteChiusura: env,
        };
    }

    private atomoInValore(atomo: AtomoAST, env: Ambiente<ValoreScheme>): ValoreScheme {
        if (typeof atomo.valore === 'string') {
            try {
                return env.applica(atomo.valore) as ValoreScheme;
            } catch {
                return atomo.valore;
            }
        }

        if (typeof atomo.valore === 'symbol') {
            throw new Error('I simboli JavaScript non sono valori Scheme supportati.');
        }

        return atomo.valore;
    }

    private valoreInNodo(valore: ValoreScheme): NodoAST {
        if (typeof valore === 'number' || typeof valore === 'boolean' || typeof valore === 'string') {
            return new AtomoAST(valore);
        }

        if (valore === null) {
            return new AtomoAST('null');
        }

        if (typeof valore === 'function') {
            return new AtomoAST('#<procedura-primitiva>');
        }

        if (this.èChiusura(valore)) {
            return new AtomoAST('#<chiusura>');
        }

        return new AtomoAST(String(valore));
    }

    private nodoFinaleInValore(nodo: NodoAST, env: Ambiente<ValoreScheme>): ValoreScheme {
        if (nodo instanceof AtomoAST) {
            return this.atomoInValore(nodo, env);
        }

        if (nodo instanceof LambdaAST) {
            return this.creaChiusuraDaLambda(nodo, env);
        }

        throw new Error('Impossibile convertire il nodo finale in un valore runtime.');
    }

    private valutaNodoFinoAValore(nodo: NodoAST, env: Ambiente<ValoreScheme>, maxPassiInterni: number = 2000): ValoreScheme {
        let corrente = nodo;

        for (let i = 0; i < maxPassiInterni; i++) {
            const passo = this.passo(corrente, env);
            if (passo.èTerminato) {
                return this.nodoFinaleInValore(passo.astSuccessivo, env);
            }
            corrente = passo.astSuccessivo;
        }

        throw new Error(`Limite massimo di ${maxPassiInterni} passi interni raggiunto nella valutazione di una chiusura.`);
    }

    private valutaCorpoChiusura(corpo: NodoAST[], env: Ambiente<ValoreScheme>): ValoreScheme {
        let risultato: ValoreScheme = null;

        for (const forma of corpo) {
            risultato = this.valutaNodoFinoAValore(forma, env);
        }

        return risultato;
    }

    private applicaChiusura(chiusura: Chiusura, argomenti: AtomoAST[], envChiamata: Ambiente<ValoreScheme>): ValoreScheme {
        if (chiusura.parametri.length !== argomenti.length) {
            throw new Error(
                `Arity mismatch: attesi ${chiusura.parametri.length} argomenti, ricevuti ${argomenti.length}.`
            );
        }

        const envLocale = new Ambiente<ValoreScheme>(chiusura.ambienteChiusura);

        for (let i = 0; i < chiusura.parametri.length; i++) {
            const nomeParametro = chiusura.parametri[i];
            const valoreArgomento = this.atomoInValore(argomenti[i], envChiamata);
            envLocale.inserisci(nomeParametro, valoreArgomento);
        }

        return this.valutaCorpoChiusura(chiusura.corpo, envLocale);
    }

    /**
     * Esegue il parsing del sorgente e applica riduzioni step-by-step.
     *
     * @param sorgente - Programma Scheme testuale.
     * @param maxPassi - Limite massimo di riduzioni per evitare loop infiniti.
     * @returns Sequenza dei passi applicati.
     */
    passiDaSorgente(sorgente: string, maxPassi: number = 200): PassoStepping[] {
        const programma = parseProgrammaDaSorgente(sorgente);
        const passi: PassoStepping[] = [];
        let corrente: NodoAST = programma;

        for (let i = 0; i < maxPassi; i++) {
            const passo = this.passo(corrente, this.env);
            passi.push(passo);

            if (passo.èTerminato) {
                return passi;
            }

            corrente = passo.astSuccessivo;
        }

        throw new Error(`Limite massimo di ${maxPassi} passi raggiunto.`);
    }

    /**
     * Esegue un singolo passo di riduzione sull'AST dato l'ambiente corrente.
     */
    passo(nodo: NodoAST, env: Ambiente<ValoreScheme> = this.env): PassoStepping {
        // ==========================================
        // 0. PROGRAMMA (sequenza di forme)
        // ==========================================
        if (nodo instanceof ProgrammaAST) {
            for (let i = 0; i < nodo.forme.length; i++) {
                const forma = nodo.forme[i];
                const subPasso = this.passo(forma, env);

                const èFormaImmutata = subPasso.èTerminato && subPasso.astSuccessivo === forma;
                if (èFormaImmutata) {
                    continue;
                }

                const nuoveForme = [...nodo.forme];
                nuoveForme[i] = subPasso.astSuccessivo;

                return {
                    astPrecedente: nodo,
                    astSuccessivo: new ProgrammaAST(nuoveForme),
                    regolaApplicata: `Programma: forma ${i + 1}/${nodo.forme.length} -> ${subPasso.regolaApplicata}`,
                    èTerminato: false,
                };
            }

            return {
                astPrecedente: nodo,
                astSuccessivo: nodo,
                regolaApplicata: 'Programma completamente ridotto',
                èTerminato: true,
            };
        }

        // ==========================================
        // 1. RISOLUZIONE DI ATOMI (Simboli/Variabili)
        // ==========================================
        if (nodo instanceof AtomoAST) {
            if (typeof nodo.valore === 'string') {
                try {
                    const valoreRisolto = env.applica(nodo.valore);

                    if (typeof valoreRisolto === 'number' || typeof valoreRisolto === 'boolean' || typeof valoreRisolto === 'string') {
                        return {
                            astPrecedente: nodo,
                            astSuccessivo: new AtomoAST(valoreRisolto),
                            regolaApplicata: `Risoluzione simbolo '${nodo.valore}' -> ${valoreRisolto}`,
                            èTerminato: false,
                        };
                    }
                } catch {
                    // Simbolo non ancora risolvibile.
                }
            }
        }

        // ==========================================
        // 2. FORMA SPECIALE: DEFINE
        // ==========================================
        if (nodo instanceof DefineAST) {
            const nomeSimbolo = String(nodo.nome.valore);

            // PATCH 1: lambda considerata valore; viene legata come chiusura.
            if (nodo.valore instanceof LambdaAST) {
                const chiusura = this.creaChiusuraDaLambda(nodo.valore, env);
                env.inserisci(nomeSimbolo, chiusura);

                return {
                    astPrecedente: nodo,
                    astSuccessivo: new AtomoAST(`#<chiusura:${nomeSimbolo}>`),
                    regolaApplicata: `Definizione funzione: '${nomeSimbolo}'`,
                    èTerminato: false,
                };
            }

            if (!(nodo.valore instanceof AtomoAST)) {
                const subPasso = this.passo(nodo.valore, env);
                return {
                    astPrecedente: nodo,
                    astSuccessivo: new DefineAST(nodo.nome, subPasso.astSuccessivo),
                    regolaApplicata: `Valutazione espressione per 'define ${nomeSimbolo}'`,
                    èTerminato: false,
                };
            }

            const valoreFinale = nodo.valore.valore;
            if (typeof valoreFinale === 'symbol') {
                throw new Error('I simboli JavaScript non possono essere definiti come valori Scheme.');
            }

            env.inserisci(nomeSimbolo, valoreFinale);

            return {
                astPrecedente: nodo,
                astSuccessivo: new AtomoAST(valoreFinale),
                regolaApplicata: `Definizione variabile: '${nomeSimbolo}' = ${valoreFinale}`,
                èTerminato: false,
            };
        }

        // ==========================================
        // 3. FORMA SPECIALE: IF
        // ==========================================
        if (nodo instanceof IfAST) {
            if (nodo.condizione instanceof AtomoAST && typeof nodo.condizione.valore === 'boolean') {
                const ramoScelto = nodo.condizione.valore ? nodo.ramoThen : nodo.ramoElse;
                return {
                    astPrecedente: nodo,
                    astSuccessivo: ramoScelto,
                    regolaApplicata: `Semplificazione 'if': condizione è ${nodo.condizione.valore}`,
                    èTerminato: false,
                };
            }

            const subPasso = this.passo(nodo.condizione, env);
            if (subPasso.èTerminato && subPasso.astSuccessivo === nodo.condizione) {
                throw new Error("Errore di Runtime: la condizione di 'if/se' non si riduce a un booleano.");
            }
            return {
                astPrecedente: nodo,
                astSuccessivo: new IfAST(subPasso.astSuccessivo, nodo.ramoThen, nodo.ramoElse),
                regolaApplicata: subPasso.regolaApplicata,
                èTerminato: false,
            };
        }

        // ==========================================
        // 4. FORMA SPECIALE: COND
        // ==========================================
        if (nodo instanceof CondAST) {
            if (nodo.clausole.length === 0) {
                return {
                    astPrecedente: nodo,
                    astSuccessivo: new AtomoAST(false),
                    regolaApplicata: 'Cond senza clausole valide -> #f',
                    èTerminato: false,
                };
            }

            const primaClausola = nodo.clausole[0];
            const èElse = primaClausola.condizione instanceof AtomoAST && primaClausola.condizione.valore === 'else';
            const èVero = primaClausola.condizione instanceof AtomoAST && primaClausola.condizione.valore === true;

            if (èElse || èVero) {
                const corpo = primaClausola.conseguenti[0] || new AtomoAST(true);
                return {
                    astPrecedente: nodo,
                    astSuccessivo: corpo,
                    regolaApplicata: èElse ? "Esecuzione ramo 'else' del cond" : 'Esecuzione clausola soddisfacente (#t)',
                    èTerminato: false,
                };
            }

            if (primaClausola.condizione instanceof AtomoAST && primaClausola.condizione.valore === false) {
                return {
                    astPrecedente: nodo,
                    astSuccessivo: new CondAST(nodo.clausole.slice(1)),
                    regolaApplicata: "Scarto clausola 'cond' con condizione #f",
                    èTerminato: false,
                };
            }

            const subPasso = this.passo(primaClausola.condizione, env);
            const nuoveClausole = [...nodo.clausole];
            nuoveClausole[0] = { ...primaClausola, condizione: subPasso.astSuccessivo };

            return {
                astPrecedente: nodo,
                astSuccessivo: new CondAST(nuoveClausole),
                regolaApplicata: subPasso.regolaApplicata,
                èTerminato: false,
            };
        }

        // ==========================================
        // 5. APPLICAZIONE DI FUNZIONE (ApplicazioneAST)
        // ==========================================
        if (nodo instanceof ApplicazioneAST) {
            const operatoreNodo = nodo.operatore;
            const argomentiNodi = nodo.argomenti;

            if (!(operatoreNodo instanceof AtomoAST) && !(operatoreNodo instanceof LambdaAST)) {
                const subPasso = this.passo(operatoreNodo, env);
                return {
                    astPrecedente: nodo,
                    astSuccessivo: new ApplicazioneAST(subPasso.astSuccessivo, argomentiNodi),
                    regolaApplicata: subPasso.regolaApplicata,
                    èTerminato: false,
                };
            }

            for (let i = 0; i < argomentiNodi.length; i++) {
                const arg = argomentiNodi[i];
                if (arg instanceof AtomoAST && typeof arg.valore === 'string') {
                    try {
                        const valoreRisolto = env.applica(arg.valore);
                        if (typeof valoreRisolto === 'number' || typeof valoreRisolto === 'boolean' || typeof valoreRisolto === 'string') {
                            const nuoviNodiArg = [...argomentiNodi];
                            nuoviNodiArg[i] = new AtomoAST(valoreRisolto);
                            return {
                                astPrecedente: nodo,
                                astSuccessivo: new ApplicazioneAST(operatoreNodo, nuoviNodiArg),
                                regolaApplicata: `Risoluzione argomento '${arg.valore}' -> ${valoreRisolto}`,
                                èTerminato: false,
                            };
                        }
                    } catch {
                        // Simbolo non risolvibile ora: si continua.
                    }
                }
            }

            let fn: ValoreScheme = null;
            if (operatoreNodo instanceof AtomoAST && typeof operatoreNodo.valore === 'string') {
                try {
                    fn = env.applica(operatoreNodo.valore);
                } catch {
                    fn = null;
                }
            } else if (operatoreNodo instanceof LambdaAST) {
                fn = this.creaChiusuraDaLambda(operatoreNodo, env);
            }

            const tuttiArgomentiRidotti = argomentiNodi.every(arg => arg instanceof AtomoAST);
            if (tuttiArgomentiRidotti) {
                const argomentiAtomici = argomentiNodi as AtomoAST[];

                if (typeof fn === 'function') {
                    const argValori = argomentiAtomici.map(arg => this.atomoInValore(arg, env));
                    const risultato = (fn as FunzionePrimitiva)(...argValori);
                    return {
                        astPrecedente: nodo,
                        astSuccessivo: this.valoreInNodo(risultato as ValoreScheme),
                        regolaApplicata: `Applicazione della funzione '${operatoreNodo instanceof AtomoAST ? String(operatoreNodo.valore) : 'lambda'}' con argomenti [${argValori.join(', ')}] -> ${String(risultato)}`,
                        èTerminato: false,
                    };
                }

                // PATCH 2 + PATCH 3: rappresentazione chiusura + applicazione chiusura.
                if (this.èChiusura(fn)) {
                    const risultato = this.applicaChiusura(fn, argomentiAtomici, env);
                    return {
                        astPrecedente: nodo,
                        astSuccessivo: this.valoreInNodo(risultato),
                        regolaApplicata: `Applicazione chiusura con argomenti [${argomentiAtomici.map(a => String(a.valore)).join(', ')}]`,
                        èTerminato: false,
                    };
                }
            }

            for (let i = 0; i < argomentiNodi.length; i++) {
                if (!(argomentiNodi[i] instanceof AtomoAST)) {
                    const subPasso = this.passo(argomentiNodi[i], env);
                    const nuoviNodiArg = [...argomentiNodi];
                    nuoviNodiArg[i] = subPasso.astSuccessivo;

                    return {
                        astPrecedente: nodo,
                        astSuccessivo: new ApplicazioneAST(operatoreNodo, nuoviNodiArg),
                        regolaApplicata: subPasso.regolaApplicata,
                        èTerminato: false,
                    };
                }
            }
        }

        // ==========================================
        // 6. COMPATIBILITA LEGACY (ListaAST)
        // ==========================================
        if (nodo instanceof ListaAST && nodo.elementi.length > 0) {
            return this.passo(new ApplicazioneAST(nodo.elementi[0], nodo.elementi.slice(1)), env);
        }

        return {
            astPrecedente: nodo,
            astSuccessivo: nodo,
            regolaApplicata: 'Nessuna ulteriore riduzione (Valore finale raggiunto)',
            èTerminato: true,
        };
    }
}
