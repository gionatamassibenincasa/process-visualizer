// file: src/lib/scheme/lexer/token.ts
/**
 * Modulo per la definizione dei token (parole lessicali) del linguaggio Scheme.
 *
 * Contiene i tipi di token riconosciuti dall'analizzatore lessicale e la struttura
 * dell'oggetto `Parola` che rappresenta un singolo elemento lessicale estratto dal sorgente.
 *
 * @module lexer/token
 * @example
 * ```typescript
 * import { TipoDiParole, type Parola } from './token';
 *
 * const token: Parola = {
 *   tipo: TipoDiParole.Numero,
 *   valore: 42
 * };
 * ```
 */

/**
 * Enumerazione dei tipi di token riconosciuti dall'analizzatore lessicale.
 */
export enum TipoDiParole {
	/** Parentesi tonda aperta `(` */
	ParentesiAperta = 'LPAREN',
	/** Parentesi tonda chiusa `)` */
	ParentesiChiusa = 'RPAREN',
	/** Apice per la citazione `'` */
	Citazione = 'QUOTE',
	/** Punto per coppie puntate `.` */
	Punto = 'DOT',
	/** Identificatore o simbolo Scheme (es. `define`, `+`, `fattoriale`) */
	Simbolo = 'SYMBOL',
	/** Valore numerico (es. `42`, `-3.14`) */
	Numero = 'NUMBER',
	/** Valore booleano (`#t`, `#f`, `#true`, `#false`) */
	Booleano = 'BOOLEAN',
	/** Stringa letterale delimitata da virgolette (es. `"testo"`) */
	Stringa = 'STRING',
	/** Segnalatore di fine file / sorgente */
	FineDelFile = 'EOF'
}

/**
 * Rappresenta un singolo token prodotto dall'analizzatore lessicale (`analizzatoreLessicale`).
 */
export interface Parola {
	/** Il tipo di token identificato. */
	tipo: TipoDiParole;
	/** Il valore associato al token (es. il valore numerico, la stringa del simbolo o `null` per EOF). */
	valore: number | boolean | string | null;
}
