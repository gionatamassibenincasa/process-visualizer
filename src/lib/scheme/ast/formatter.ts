// file: src/lib/scheme/ast/formatter.ts
/**
 * Modulo per la formattazione e serializzazione degli albero AST Scheme.
 *
 * Implementa il pattern `VisitorAST` per convertire nodi dell'AST (`NodoAST`) in
 * codice sorgente Scheme formattato e leggibile. Produce inoltre snapshot dei passi
 * e timeline testuali per la visualizzazione dello stepper nella UI o da riga di comando.
 *
 * @module ast/formatter
 * @example
 * ```typescript
 * import { FormatterScheme } from './formatter';
 * import { parseProgrammaDaSorgente } from './parser';
 *
 * const ast = parseProgrammaDaSorgente('(+ 1 2)');
 * const formatter = new FormatterScheme();
 * console.log(formatter.stampa(ast)); // "(+ 1 2)"
 * ```
 */

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
import type { SnapshotAmbiente } from '../runtime/ambiente';

/**
 * Metadati della forma top-level del programma attualmente in fase di riduzione.
 */
export interface FocusFormaProgramma {
	/** Indice della forma corrente (1-indexed). */
	indiceForma: number;
	/** Numero totale delle forme che compongono il programma. */
	totaleForme: number;
}

/**
 * Istantanea serializzabile di un singolo passo di riduzione dello stepper.
 */
export interface SnapshotPassoStepping {
	/** Indice progressivo del passo (0-indexed). */
	indice: number;
	/** Descrizione testuale della regola applicata. */
	regola: string;
	/** Codice Scheme dell'AST prima della riduzione. */
	precedente: string;
	/** Codice Scheme dell'AST dopo la riduzione. */
	successivo: string;
	/** `true` se il programma ha raggiunto il valore finale. */
	terminato: boolean;
	/** `true` se lo stato dell'AST è cambiato in questo passo. */
	haRidotto: boolean;
	/** Metadati sulla forma top-level in corso di riduzione (se presente). */
	focusProgramma: FocusFormaProgramma | null;
	/** Istantanea dell'ambiente di calcolo al passo corrente. */
	ambiente: SnapshotAmbiente;
}

/**
 * Formattatore per convertire nodi AST e timeline di stepping in stringhe Scheme leggibili.
 *
 * @example
 * ```typescript
 * const formatter = new FormatterScheme();
 * const testo = formatter.stampa(nodoAST);
 * const timelineText = formatter.formattaTimelineTestuale(passiStepping);
 * ```
 */
export class FormatterScheme implements VisitorAST<string> {
	private indentLevel: number = 0;

	/**
	 * Restituisce la stringa di spaziatura per l'indentazione corrente.
	 */
	private getIndent(): string {
		return '  '.repeat(this.indentLevel);
	}

	/**
	 * Converte un qualsiasi nodo dell'AST in una stringa di codice Scheme formattata.
	 *
	 * @param nodo - Nodo AST da formattare.
	 * @returns Rappresentazione testuale del nodo.
	 * @example
	 * ```typescript
	 * const f = new FormatterScheme();
	 * console.log(f.stampa(new AtomoAST(42))); // "42"
	 * ```
	 */
	stampa(nodo: NodoAST): string {
		return nodo.accetta(this);
	}

	/**
	 * Converte un singolo passo dello stepper in uno snapshot serializzabile per la UI.
	 *
	 * @param passo - Passo di stepping da formattare.
	 * @param indice - Indice posizionale del passo.
	 * @returns Istanza di {@link SnapshotPassoStepping}.
	 * @example
	 * ```typescript
	 * const snapshot = formatter.formattaPassoStepping(passo, 0);
	 * ```
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
			focusProgramma: this.estraiFocusProgramma(passo.regolaApplicata),
			ambiente: passo.ambiente
		};
	}

	/**
	 * Converte un'intera sequenza di passi dello stepper in un array di snapshot per il rendering della timeline UI.
	 *
	 * @param passi - Elenco dei passi registrati dallo stepper.
	 * @returns Array di {@link SnapshotPassoStepping}.
	 * @example
	 * ```typescript
	 * const timelineUI = formatter.formattaTimelineStepping(passi);
	 * ```
	 */
	formattaTimelineStepping(passi: PassoStepping[]): SnapshotPassoStepping[] {
		return passi.map((passo, indice) => this.formattaPassoStepping(passo, indice));
	}

	/**
	 * Converte una sequenza di passi in un testo multilinea descrittivo utile per log o CLI.
	 *
	 * @param passi - Sequenza di passi dello stepper.
	 * @returns Testo formattato riga per riga.
	 * @example
	 * ```typescript
	 * const traccia = formatter.formattaTimelineTestuale(passi);
	 * console.log(traccia);
	 * ```
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
	 * Converte una sequenza di passi dello stepper in un documento Markdown compatibile con Slidev (`sli.dev`).
	 *
	 * @param passi - Sequenza di passi dello stepper.
	 * @param titolo - Titolo della presentazione Slidev (default `"Visualizzazione Esecuzione Scheme"`).
	 * @returns Stringa Markdown per Slidev con slide separate da `---`.
	 * @example
	 * ```typescript
	 * const markdownSlidev = formatter.formattaTimelineSlidev(passi, 'Fattoriale di 5');
	 * ```
	 */
	formattaTimelineSlidev(
		passi: PassoStepping[],
		titolo: string = 'Visualizzazione Esecuzione Scheme'
	): string {
		const snapshots = this.formattaTimelineStepping(passi);
		const slideIniziale = `---
theme: default
title: "${titolo}"
info: "Presentazione automatica generata dallo Stepper Scheme"
---

# ${titolo}

Traccia automatica dell'esecuzione dello stepper Scheme.

- **Totale Passi:** ${snapshots.length}
- **Stato Finale:** ${snapshots[snapshots.length - 1]?.terminato ? 'Completato' : 'Incompleto'}

`;

		const slidesPassi = snapshots
			.map((s) => {
				const badge = s.terminato ? 'VALORE FINALE' : 'RIDUZIONE';
				const envBindings = s.ambiente.scope
					.flatMap((scope) => Object.entries(scope.binding))
					.map(([k, v]) => `  ${k}: ${v}`)
					.join('\n');

				return `---
layout: default
---

# Passo ${s.indice + 1} / ${snapshots.length} \`<${badge}>\`

### Stato AST
\`\`\`scheme
${s.successivo}
\`\`\`

> **Regola applicata:** ${s.regola}

${envBindings ? `### Ambiente\n\`\`\`yaml\n${envBindings}\n\`\`\`\n` : ''}`;
			})
			.join('\n');

		return slideIniziale + slidesPassi;
	}

	/**
	 * Analizza il testo della regola applicata per estrarre l'indice della forma top-level in esecuzione.
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

	visitaProgramma(nodo: ProgrammaAST): string {
		return nodo.forme.map((forma) => forma.accetta(this)).join('\n');
	}

	visitaAtomo(nodo: AtomoAST): string {
		if (typeof nodo.valore === 'boolean') {
			return nodo.valore ? '#t' : '#f';
		}
		return String(nodo.valore);
	}

	visitaCitazione(nodo: CitazioneAST): string {
		if (nodo.espressione instanceof NodoAST) {
			return `'${nodo.espressione.accetta(this)}`;
		}
		return `'${nodo.espressione.toString()}`;
	}

	visitaLista(nodo: ListaAST): string {
		const el = nodo.elementi.map((e) => e.accetta(this)).join(' ');
		return `(${el})`;
	}

	visitaDefine(nodo: DefineAST): string {
		const nome = nodo.nome.accetta(this);
		const val = nodo.valore.accetta(this);
		return `(define ${nome} ${val})`;
	}

	visitaLambda(nodo: LambdaAST): string {
		const parametri = nodo.parametri.map((p) => p.accetta(this)).join(' ');
		const corpo = nodo.corpo.map((expr) => expr.accetta(this)).join(' ');
		return `(lambda (${parametri}) ${corpo})`;
	}

	visitaApplicazione(nodo: ApplicazioneAST): string {
		const operatore = nodo.operatore.accetta(this);
		const argomenti = nodo.argomenti.map((arg) => arg.accetta(this)).join(' ');
		return `(${operatore}${argomenti ? ` ${argomenti}` : ''})`;
	}

	visitaIf(nodo: IfAST): string {
		const cond = nodo.condizione.accetta(this);

		this.indentLevel++;
		const thenStr = nodo.ramoThen.accetta(this);
		const elseStr = nodo.ramoElse.accetta(this);
		this.indentLevel--;

		return `(if ${cond}\n${this.getIndent()}  ${thenStr}\n${this.getIndent()}  ${elseStr})`;
	}

	visitaAnd(nodo: AndAST): string {
		const exprs = nodo.espressioni.map((e) => e.accetta(this)).join(' ');
		return `(and ${exprs})`;
	}

	visitaOr(nodo: OrAST): string {
		const exprs = nodo.espressioni.map((e) => e.accetta(this)).join(' ');
		return `(or ${exprs})`;
	}

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
