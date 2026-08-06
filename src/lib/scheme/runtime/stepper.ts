// file: stepper.ts
import {
	ApplicazioneAST,
	AndAST,
	AtomoAST,
	CitazioneAST,
	CondAST,
	DefineAST,
	IfAST,
	LambdaAST,
	ListaAST,
	NodoAST,
	OrAST,
	ProgrammaAST
} from '../ast/ast';
import { Atomo } from '../ast/atomo';
import { Coppia } from '../ast/coppia';
import { Lista } from '../ast/lista';
import { parseProgrammaDaSorgente } from '../ast/parser';
import { Ambiente, type SnapshotAmbiente } from './ambiente';
import { creaAmbiente } from './registroAmbienti';
import type { Chiusura, FunzionePrimitiva, ValoreScheme } from './valori';

export interface PassoStepping {
	astPrecedente: NodoAST;
	astSuccessivo: NodoAST;
	regolaApplicata: string;
	èTerminato: boolean;
	ambiente: SnapshotAmbiente;
}

type PassoInterno = Omit<PassoStepping, 'ambiente'>;

/**
 * Utility per estrarre l'id dell'ambiente dalla prima riga del sorgente:
 * ; ambiente: <id-ambiente>
 */
export function leggiDichiarazioneAmbiente(sorgente: string): string | null {
	const righe = sorgente.split(/\r?\n/);
	if (righe.length === 0) {
		return null;
	}

	const primaRiga = righe[0].trim();
	const match = primaRiga.match(/^;\s*ambiente:\s*(\S+)$/);
	return match ? match[1] : null;
}

export class StepperScheme {
	private env: Ambiente<ValoreScheme>;

	/**
	 * Inizializza lo StepperScheme.
	 * @param envOrId Un'istanza di Ambiente esistente oppure l'ID dell'ambiente da creare.
	 *                Se non specificato, viene creato l'ambiente di default ("standard").
	 */
	constructor(envOrId?: Ambiente<ValoreScheme> | string) {
		if (typeof envOrId === 'string') {
			this.env = creaAmbiente(envOrId);
		} else if (envOrId instanceof Ambiente) {
			this.env = envOrId;
		} else {
			// Se undefined o non passato, creaAmbiente() usa il default ('standard')
			this.env = creaAmbiente();
		}
	}

	/**
	 * Factory Method: Istanzia lo StepperScheme dal codice sorgente.
	 *
	 * Priorità dell'ambiente:
	 * 1. `ambienteOverride` (se passato esplicitamente, ad es. da CLI)
	 * 2. ID dell'ambiente specificato nella prima riga del file (es: `; ambiente: minimo-numeri-naturali`)
	 * 3. Ambiente di default ("standard")
	 */
	static daSorgente(sorgente: string, ambienteOverride?: Ambiente<ValoreScheme>): StepperScheme {
		if (ambienteOverride) {
			return new StepperScheme(ambienteOverride);
		}

		const idDichiarato = leggiDichiarazioneAmbiente(sorgente);
		if (idDichiarato) {
			// Passeremo la stringa al costruttore, che invocherà creaAmbiente(idDichiarato)
			// sollevando AmbienteNonTrovatoError se l'ID è errato.
			return new StepperScheme(idDichiarato);
		}

		return new StepperScheme();
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
			parametri: lambda.parametri.map((param) => String(param.valore)),
			corpo: lambda.corpo,
			ambienteChiusura: env
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

	private valoreDaCitazione(espressione: CitazioneAST['espressione']): ValoreScheme {
		if (espressione instanceof Atomo) {
			return espressione.valore;
		}

		if (espressione instanceof Lista) {
			const elementi: ValoreScheme[] = [];
			let listaCorrente: Lista | null = espressione;

			while (listaCorrente !== null && !listaCorrente.vuoto()) {
				const elemento = listaCorrente.primo;
				if (elemento === null) {
					elementi.push([]);
				} else {
					elementi.push(this.valoreDaCitazione(elemento));
				}
				listaCorrente = listaCorrente.resto;
			}

			return elementi;
		}

		if (espressione instanceof Coppia) {
			throw new Error('Le coppie puntate quotate non sono ancora supportate dal runtime.');
		}

		if (espressione instanceof AtomoAST) {
			if (typeof espressione.valore === 'symbol') {
				throw new Error('I simboli JavaScript non sono valori Scheme supportati.');
			}

			return espressione.valore;
		}

		throw new Error('Datum citato non supportato dal runtime.');
	}

	private valoreDaNodo(nodo: NodoAST, env: Ambiente<ValoreScheme>): ValoreScheme | undefined {
		if (nodo instanceof AtomoAST) {
			return this.atomoInValore(nodo, env);
		}

		if (nodo instanceof CitazioneAST) {
			return this.valoreDaCitazione(nodo.espressione);
		}

		if (nodo instanceof LambdaAST) {
			return this.creaChiusuraDaLambda(nodo, env);
		}

		return undefined;
	}

	private serializzaValore(valore: ValoreScheme): string {
		if (typeof valore === 'boolean') {
			return valore ? '#t' : '#f';
		}

		if (typeof valore === 'number' || typeof valore === 'string') {
			return String(valore);
		}

		if (valore === null) {
			return 'null';
		}

		if (typeof valore === 'function') {
			return '#<primitiva>';
		}

		if (this.èChiusura(valore)) {
			return '#<chiusura>';
		}

		return `(${valore.map((elemento) => this.serializzaValore(elemento)).join(' ')})`;
	}

	private istanziaCorpoChiusura(chiusura: Chiusura, argomenti: ValoreScheme[]): NodoAST {
		if (chiusura.parametri.length !== argomenti.length) {
			throw new Error(
				`Arity mismatch: attesi ${chiusura.parametri.length} argomenti, ricevuti ${argomenti.length}.`
			);
		}

		const sostituzioni = new Map<string, NodoAST>();
		for (let i = 0; i < chiusura.parametri.length; i += 1) {
			sostituzioni.set(chiusura.parametri[i], this.valoreInNodo(argomenti[i]));
		}

		const corpo = chiusura.corpo.map((forma) => this.sostituisciParametri(forma, sostituzioni));
		return corpo.length === 1 ? corpo[0] : new ProgrammaAST(corpo);
	}

	private sostituisciParametri(nodo: NodoAST, sostituzioni: ReadonlyMap<string, NodoAST>): NodoAST {
		if (nodo instanceof AtomoAST) {
			if (typeof nodo.valore === 'string' && sostituzioni.has(nodo.valore)) {
				return sostituzioni.get(nodo.valore)!;
			}

			return new AtomoAST(nodo.valore);
		}

		if (nodo instanceof CitazioneAST) {
			return nodo;
		}

		if (nodo instanceof ProgrammaAST) {
			return new ProgrammaAST(
				nodo.forme.map((forma) => this.sostituisciParametri(forma, sostituzioni))
			);
		}

		if (nodo instanceof DefineAST) {
			return new DefineAST(
				new AtomoAST(nodo.nome.valore),
				this.sostituisciParametri(nodo.valore, sostituzioni)
			);
		}

		if (nodo instanceof LambdaAST) {
			const sostituzioniCorpo = new Map(sostituzioni);
			for (const parametro of nodo.parametri) {
				if (typeof parametro.valore === 'string') {
					sostituzioniCorpo.delete(parametro.valore);
				}
			}

			return new LambdaAST(
				nodo.parametri.map((parametro) => new AtomoAST(parametro.valore)),
				nodo.corpo.map((forma) => this.sostituisciParametri(forma, sostituzioniCorpo))
			);
		}

		if (nodo instanceof IfAST) {
			return new IfAST(
				this.sostituisciParametri(nodo.condizione, sostituzioni),
				this.sostituisciParametri(nodo.ramoThen, sostituzioni),
				this.sostituisciParametri(nodo.ramoElse, sostituzioni)
			);
		}

		if (nodo instanceof AndAST) {
			return new AndAST(
				nodo.espressioni.map((espressione) => this.sostituisciParametri(espressione, sostituzioni))
			);
		}

		if (nodo instanceof OrAST) {
			return new OrAST(
				nodo.espressioni.map((espressione) => this.sostituisciParametri(espressione, sostituzioni))
			);
		}

		if (nodo instanceof CondAST) {
			return new CondAST(
				nodo.clausole.map((clausola) => ({
					condizione: this.sostituisciParametri(clausola.condizione, sostituzioni),
					conseguenti: clausola.conseguenti.map((conseguente) =>
						this.sostituisciParametri(conseguente, sostituzioni)
					)
				}))
			);
		}

		if (nodo instanceof ApplicazioneAST) {
			return new ApplicazioneAST(
				this.sostituisciParametri(nodo.operatore, sostituzioni),
				nodo.argomenti.map((argomento) => this.sostituisciParametri(argomento, sostituzioni))
			);
		}

		if (nodo instanceof ListaAST) {
			return new ListaAST(
				nodo.elementi.map((elemento) => this.sostituisciParametri(elemento, sostituzioni))
			);
		}

		return nodo;
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
	 * Esegue il parsing del sorgente ed emette le riduzioni step-by-step in modalità streaming.
	 *
	 * @param sorgente - Programma Scheme testuale.
	 * @param maxPassi - Limite massimo di riduzioni per evitare loop infiniti.
	 * @yields Ciascun PassoStepping calcolato in tempo reale.
	 * @throws {Error} Se viene raggiunto il limite massimo di passi senza che il programma sia terminato.
	 */
	*passiStream(sorgente: string, maxPassi: number = 200): Generator<PassoStepping> {
		const programma = parseProgrammaDaSorgente(sorgente);
		let corrente: NodoAST = programma;

		for (let i = 0; i < maxPassi; i++) {
			const passo = this.passo(corrente, this.env);
			yield passo;

			if (passo.èTerminato) {
				return;
			}

			corrente = passo.astSuccessivo;
		}

		throw new Error(`Limite massimo di ${maxPassi} passi raggiunto.`);
	}

	/**
	 * Esegue un singolo passo di riduzione sull'AST dato l'ambiente corrente.
	 */
	passo(nodo: NodoAST, env: Ambiente<ValoreScheme> = this.env): PassoStepping {
		const passo = this.passoInterno(nodo, env);

		return {
			...passo,
			ambiente: env.istantanea((valore) => this.serializzaValore(valore))
		};
	}

	private passoInterno(nodo: NodoAST, env: Ambiente<ValoreScheme>): PassoInterno {
		// ==========================================
		// 0. PROGRAMMA (sequenza di forme)
		// ==========================================
		if (nodo instanceof ProgrammaAST) {
			for (let i = 0; i < nodo.forme.length; i++) {
				const forma = nodo.forme[i];
				const subPasso = this.passoInterno(forma, env);

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
					èTerminato: false
				};
			}

			return {
				astPrecedente: nodo,
				astSuccessivo: nodo,
				regolaApplicata: 'Programma completamente ridotto',
				èTerminato: true
			};
		}

		// ==========================================
		// 1. RISOLUZIONE DI ATOMI (Simboli/Variabili)
		// ==========================================
		if (nodo instanceof AtomoAST) {
			if (typeof nodo.valore === 'string') {
				try {
					const valoreRisolto = env.applica(nodo.valore);

					if (
						typeof valoreRisolto === 'number' ||
						typeof valoreRisolto === 'boolean' ||
						typeof valoreRisolto === 'string'
					) {
						return {
							astPrecedente: nodo,
							astSuccessivo: new AtomoAST(valoreRisolto),
							regolaApplicata: `Risoluzione simbolo '${nodo.valore}' -> ${valoreRisolto}`,
							èTerminato: false
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
					èTerminato: false
				};
			}

			if (!(nodo.valore instanceof AtomoAST)) {
				const subPasso = this.passoInterno(nodo.valore, env);
				return {
					astPrecedente: nodo,
					astSuccessivo: new DefineAST(nodo.nome, subPasso.astSuccessivo),
					regolaApplicata: `Valutazione espressione per 'define ${nomeSimbolo}'`,
					èTerminato: false
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
				èTerminato: false
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
					èTerminato: false
				};
			}

			const subPasso = this.passoInterno(nodo.condizione, env);
			if (subPasso.èTerminato && subPasso.astSuccessivo === nodo.condizione) {
				throw new Error("Errore di Runtime: la condizione di 'if/se' non si riduce a un booleano.");
			}
			return {
				astPrecedente: nodo,
				astSuccessivo: new IfAST(subPasso.astSuccessivo, nodo.ramoThen, nodo.ramoElse),
				regolaApplicata: subPasso.regolaApplicata,
				èTerminato: false
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
					èTerminato: false
				};
			}

			const primaClausola = nodo.clausole[0];
			const èElse =
				primaClausola.condizione instanceof AtomoAST && primaClausola.condizione.valore === 'else';
			const èVero =
				primaClausola.condizione instanceof AtomoAST && primaClausola.condizione.valore === true;

			if (èElse || èVero) {
				const corpo = primaClausola.conseguenti[0] || new AtomoAST(true);
				return {
					astPrecedente: nodo,
					astSuccessivo: corpo,
					regolaApplicata: èElse
						? "Esecuzione ramo 'else' del cond"
						: 'Esecuzione clausola soddisfacente (#t)',
					èTerminato: false
				};
			}

			if (
				primaClausola.condizione instanceof AtomoAST &&
				primaClausola.condizione.valore === false
			) {
				return {
					astPrecedente: nodo,
					astSuccessivo: new CondAST(nodo.clausole.slice(1)),
					regolaApplicata: "Scarto clausola 'cond' con condizione #f",
					èTerminato: false
				};
			}

			const subPasso = this.passoInterno(primaClausola.condizione, env);
			const nuoveClausole = [...nodo.clausole];
			nuoveClausole[0] = { ...primaClausola, condizione: subPasso.astSuccessivo };

			return {
				astPrecedente: nodo,
				astSuccessivo: new CondAST(nuoveClausole),
				regolaApplicata: subPasso.regolaApplicata,
				èTerminato: false
			};
		}

		// ==========================================
		// 5. APPLICAZIONE DI FUNZIONE (ApplicazioneAST)
		// ==========================================
		if (nodo instanceof ApplicazioneAST) {
			const operatoreNodo = nodo.operatore;
			const argomentiNodi = nodo.argomenti;

			if (!(operatoreNodo instanceof AtomoAST) && !(operatoreNodo instanceof LambdaAST)) {
				const subPasso = this.passoInterno(operatoreNodo, env);
				return {
					astPrecedente: nodo,
					astSuccessivo: new ApplicazioneAST(subPasso.astSuccessivo, argomentiNodi),
					regolaApplicata: subPasso.regolaApplicata,
					èTerminato: false
				};
			}

			for (let i = 0; i < argomentiNodi.length; i++) {
				const arg = argomentiNodi[i];
				if (arg instanceof AtomoAST && typeof arg.valore === 'string') {
					try {
						const valoreRisolto = env.applica(arg.valore);
						if (
							typeof valoreRisolto === 'number' ||
							typeof valoreRisolto === 'boolean' ||
							typeof valoreRisolto === 'string'
						) {
							const nuoviNodiArg = [...argomentiNodi];
							nuoviNodiArg[i] = new AtomoAST(valoreRisolto);
							return {
								astPrecedente: nodo,
								astSuccessivo: new ApplicazioneAST(operatoreNodo, nuoviNodiArg),
								regolaApplicata: `Risoluzione argomento '${arg.valore}' -> ${valoreRisolto}`,
								èTerminato: false
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

			const argValori = argomentiNodi.map((argomento) => this.valoreDaNodo(argomento, env));
			const tuttiArgomentiRidotti = argValori.every(
				(argomento): argomento is ValoreScheme => argomento !== undefined
			);
			if (tuttiArgomentiRidotti) {
				if (typeof fn === 'function') {
					const risultato = (fn as FunzionePrimitiva)(...argValori);
					return {
						astPrecedente: nodo,
						astSuccessivo: this.valoreInNodo(risultato as ValoreScheme),
						regolaApplicata: `Applicazione della funzione '${operatoreNodo instanceof AtomoAST ? String(operatoreNodo.valore) : 'lambda'}' con argomenti [${argValori.join(', ')}] -> ${String(risultato)}`,
						èTerminato: false
					};
				}

				// PATCH 2 + PATCH 3: rappresentazione chiusura + applicazione chiusura.
				if (this.èChiusura(fn)) {
					const corpoIstanziato = this.istanziaCorpoChiusura(fn, argValori);
					return {
						astPrecedente: nodo,
						astSuccessivo: corpoIstanziato,
						regolaApplicata: `Riscrittura lambda: ${fn.parametri
							.map(
								(parametro, indice) => `${parametro} ← ${this.serializzaValore(argValori[indice])}`
							)
							.join(', ')}`,
						èTerminato: false
					};
				}
			}

			for (let i = 0; i < argomentiNodi.length; i++) {
				if (!(argomentiNodi[i] instanceof AtomoAST)) {
					const subPasso = this.passoInterno(argomentiNodi[i], env);
					const nuoviNodiArg = [...argomentiNodi];
					nuoviNodiArg[i] = subPasso.astSuccessivo;

					return {
						astPrecedente: nodo,
						astSuccessivo: new ApplicazioneAST(operatoreNodo, nuoviNodiArg),
						regolaApplicata: subPasso.regolaApplicata,
						èTerminato: false
					};
				}
			}
		}

		// ==========================================
		// 6. COMPATIBILITA LEGACY (ListaAST)
		// ==========================================
		if (nodo instanceof ListaAST && nodo.elementi.length > 0) {
			return this.passoInterno(new ApplicazioneAST(nodo.elementi[0], nodo.elementi.slice(1)), env);
		}

		return {
			astPrecedente: nodo,
			astSuccessivo: nodo,
			regolaApplicata: 'Nessuna ulteriore riduzione (Valore finale raggiunto)',
			èTerminato: true
		};
	}
}
