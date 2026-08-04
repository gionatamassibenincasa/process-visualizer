import {
	NodoAST,
	ProgrammaAST,
	AtomoAST,
	CitazioneAST,
	ListaAST,
	DefineAST,
	LambdaAST,
	ApplicazioneAST,
	IfAST,
	AndAST,
	OrAST,
	CondAST
} from './ast';
import type { VisitorAST } from './ast';
import type { PassoStepping } from '../runtime/stepper';

/**
 * Metadati opzionali della forma top-level attualmente ridotta.
 */
export interface FocusFormaProgramma {
	indiceForma: number;
	totaleForme: number;
}

/**
 * Snapshot serializzabile di un passo, pronta per timeline UI.
 */
export interface SnapshotPassoStepping {
	indice: number;
	regola: string;
	precedente: string;
	successivo: string;
	terminato: boolean;
	haRidotto: boolean;
	focusProgramma: FocusFormaProgramma | null;
}

/**
 * Formatta un AST Scheme in una stringa leggibile e vicino alla sintassi Lisp.
 */
export class FormatterScheme implements VisitorAST<string> {
	private indentLevel: number = 0;

	/**
	 * Restituisce il prefisso di indentazione corrente.
	 */
	private getIndent(): string {
		return '  '.repeat(this.indentLevel);
	}

	/**
	 * Produce la rappresentazione testuale di un nodo AST.
	 *
	 * @param nodo - Nodo da formattare.
	 * @returns La stringa formattata.
	 */
	stampa(nodo: NodoAST): string {
		return nodo.accetta(this);
	}

	/**
	 * Converte un passo dello stepper in uno snapshot descrittivo adatto alla UI.
	 *
	 * @param passo - Passo prodotto dallo stepper.
	 * @param indice - Indice del passo nella timeline (base 0).
	 * @returns Snapshot testuale e metadati utili alla visualizzazione.
	 */
	formattaPassoStepping(passo: PassoStepping, indice: number): SnapshotPassoStepping {
		const precedente = this.stampa(passo.astPrecedente);
		const successivo = this.stampa(passo.astSuccessivo);

		return {
			indice,
			regola: passo.regolaApplicata,
			precedente,
			successivo,
			terminato: passo.èTerminato,
			haRidotto: precedente !== successivo,
			focusProgramma: this.estraiFocusProgramma(passo.regolaApplicata)
		};
	}

	/**
	 * Converte una lista di passi in una timeline strutturata per front-end.
	 *
	 * @param passi - Sequenza di passi dello stepper.
	 * @returns Array ordinato di snapshot pronti per il rendering.
	 */
	formattaTimelineStepping(passi: PassoStepping[]): SnapshotPassoStepping[] {
		return passi.map((passo, indice) => this.formattaPassoStepping(passo, indice));
	}

	/**
	 * Produce una traccia testuale lineare utile per log e debug rapidi.
	 *
	 * @param passi - Sequenza di passi da serializzare.
	 * @returns Testo multi-linea con transizioni prima/dopo e regole applicate.
	 */
	formattaTimelineTestuale(passi: PassoStepping[]): string {
		const snapshot = this.formattaTimelineStepping(passi);
		return snapshot
			.map((s) => {
				const badge = s.terminato ? 'TERMINATO' : 'RIDUZIONE';
				return `[${s.indice}] ${badge} | ${s.precedente} ==> ${s.successivo} | ${s.regola}`;
			})
			.join('\n');
	}

	/**
	 * Interpreta la regola del passo per individuare la forma top-level in riduzione.
	 */
	private estraiFocusProgramma(regola: string): FocusFormaProgramma | null {
		const match = /^Programma: forma (\d+)\/(\d+) ->/.exec(regola);
		if (!match) {
			return null;
		}

		return {
			indiceForma: Number(match[1]),
			totaleForme: Number(match[2])
		};
	}

	/**
	 * Formatta un programma come sequenza di forme, una per riga.
	 *
	 * @param nodo - Programma da formattare.
	 * @returns La stringa formattata.
	 */
	visitaProgramma(nodo: ProgrammaAST): string {
		return nodo.forme.map((forma) => forma.accetta(this)).join('\n');
	}

	/**
	 * Formatta un nodo atomico.
	 *
	 * @param nodo - Nodo atomico da convertire.
	 * @returns La rappresentazione testuale dell'atomo.
	 */
	visitaAtomo(nodo: AtomoAST): string {
		if (typeof nodo.valore === 'boolean') {
			return nodo.valore ? '#t' : '#f';
		}
		return String(nodo.valore);
	}

	/**
	 * Formatta una citazione aggiungendo il prefisso quote.
	 *
	 * @param nodo - Nodo di citazione.
	 * @returns La stringa formattata.
	 */
	visitaCitazione(nodo: CitazioneAST): string {
		if (nodo.espressione instanceof NodoAST) {
			return `'${nodo.espressione.accetta(this)}`;
		}
		return `'${nodo.espressione.toString()}`;
	}

	/**
	 * Formatta una lista come una sequenza tra parentesi.
	 *
	 * @param nodo - Nodo lista.
	 * @returns La stringa formattata.
	 */
	visitaLista(nodo: ListaAST): string {
		const el = nodo.elementi.map((e) => e.accetta(this)).join(' ');
		return `(${el})`;
	}

	/**
	 * Formatta una definizione di variabile o funzione.
	 *
	 * @param nodo - Nodo define.
	 * @returns La stringa formattata.
	 */
	visitaDefine(nodo: DefineAST): string {
		const nome = nodo.nome.accetta(this);
		const val = nodo.valore.accetta(this);
		return `(define ${nome} ${val})`;
	}

	/**
	 * Formatta una lambda in sintassi Scheme canonica.
	 *
	 * @param nodo - Nodo lambda.
	 * @returns La stringa formattata.
	 */
	visitaLambda(nodo: LambdaAST): string {
		const parametri = nodo.parametri.map((p) => p.accetta(this)).join(' ');
		const corpo = nodo.corpo.map((expr) => expr.accetta(this)).join(' ');
		return `(lambda (${parametri}) ${corpo})`;
	}

	/**
	 * Formatta una applicazione di funzione.
	 *
	 * @param nodo - Nodo applicazione.
	 * @returns La stringa formattata.
	 */
	visitaApplicazione(nodo: ApplicazioneAST): string {
		const operatore = nodo.operatore.accetta(this);
		const argomenti = nodo.argomenti.map((arg) => arg.accetta(this)).join(' ');
		return `(${operatore}${argomenti ? ` ${argomenti}` : ''})`;
	}

	/**
	 * Formatta una condizione if con una rappresentazione multilinea quando necessario.
	 *
	 * @param nodo - Nodo if.
	 * @returns La stringa formattata.
	 */
	visitaIf(nodo: IfAST): string {
		const cond = nodo.condizione.accetta(this);

		this.indentLevel++;
		const thenStr = nodo.ramoThen.accetta(this);
		const elseStr = nodo.ramoElse.accetta(this);
		this.indentLevel--;

		return `(if ${cond}\n${this.getIndent()}  ${thenStr}\n${this.getIndent()}  ${elseStr})`;
	}

	/**
	 * Formatta una forma and.
	 *
	 * @param nodo - Nodo and.
	 * @returns La stringa formattata.
	 */
	visitaAnd(nodo: AndAST): string {
		const exprs = nodo.espressioni.map((e) => e.accetta(this)).join(' ');
		return `(and ${exprs})`;
	}

	/**
	 * Formatta una forma or.
	 *
	 * @param nodo - Nodo or.
	 * @returns La stringa formattata.
	 */
	visitaOr(nodo: OrAST): string {
		const exprs = nodo.espressioni.map((e) => e.accetta(this)).join(' ');
		return `(or ${exprs})`;
	}

	/**
	 * Formatta una forma cond con le relative clausole.
	 *
	 * @param nodo - Nodo cond.
	 * @returns La stringa formattata.
	 */
	visitaCond(nodo: CondAST): string {
		this.indentLevel++;
		const clausoleStr = nodo.clausole
			.map((c) => {
				const cond = c.condizione.accetta(this);
				const cons = c.conseguenti.map((e) => e.accetta(this)).join(' ');
				return `${this.getIndent()}[${cond} ${cons}]`;
			})
			.join('\n');
		this.indentLevel--;

		return `(cond\n${clausoleStr})`;
	}
}
