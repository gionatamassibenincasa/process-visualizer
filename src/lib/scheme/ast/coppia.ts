// file: src/lib/scheme/ast/coppia.ts
/**
 * Modulo per la rappresentazione e gestione delle coppie (dotted pair) in Scheme.
 *
 * Una coppia è la struttura dati binaria fondamentale di Scheme (cons cell),
 * composta da due elementi denominati `primo` (car) e `resto` (cdr).
 *
 * @module ast/coppia
 * @example
 * ```typescript
 * import { Coppia } from './coppia';
 * import { Atomo, TipoAtomo } from './atomo';
 *
 * const c = new Coppia(new Atomo(1, TipoAtomo.NUMERO), new Atomo(2, TipoAtomo.NUMERO));
 * console.log(c.toString()); // "(1 . 2)"
 * ```
 */

import { Atomo, TipoAtomo } from './atomo';
import { TipoDiParole } from '../lexer/token';
import type { Parola } from '../lexer/token';
import { analizzatoreLessicale } from '../lexer/lexer';
import type { Lista } from './lista';

/**
 * Definisce il tipo di elemento che può comparire all'interno di una coppia Scheme.
 * Può essere un `Atomo`, un'altra `Coppia`, una `Lista` o `null` (lista vuota).
 */
export type TipoElemento = Atomo | Coppia | Lista | null;

/**
 * Rappresenta una coppia Scheme (dotted pair `(primo . resto)`).
 *
 * Incapsula il primo elemento (car) e il secondo elemento / resto (cdr) della coppia.
 * Fornisce metodi per la serializzazione `toString` e per il parsing da stringa `Coppia.fromString`.
 *
 * @example
 * ```typescript
 * const coppia = Coppia.fromString('(1 . 2)');
 * console.log(coppia.primo.valore); // 1
 * console.log(coppia.resto.valore); // 2
 * ```
 */
export class Coppia {
	private readonly _primo: TipoElemento;
	private readonly _resto: TipoElemento;

	/**
	 * Crea una nuova coppia Scheme.
	 *
	 * @param primo - Primo elemento della coppia (car).
	 * @param resto - Secondo elemento o coda della coppia (cdr).
	 */
	constructor(primo: TipoElemento, resto: TipoElemento) {
		this._primo = primo;
		this._resto = resto;
	}

	/**
	 * Restituisce il primo elemento della coppia (car).
	 */
	get primo(): TipoElemento {
		return this._primo;
	}

	/**
	 * Restituisce il resto della coppia (cdr).
	 */
	get resto(): TipoElemento {
		return this._resto;
	}

	/**
	 * Type guard per verificare se un valore generico è un'istanza di `Coppia`.
	 *
	 * @param a - Valore da verificare.
	 * @returns `true` se il valore è un'istanza di `Coppia`.
	 * @example
	 * ```typescript
	 * Coppia.èCoppia(new Coppia(null, null)); // true
	 * Coppia.èCoppia(42); // false
	 * ```
	 */
	static èCoppia(a: unknown): a is Coppia {
		return a instanceof Coppia;
	}

	/**
	 * Restituisce la rappresentazione testuale della coppia nel formato dotted pair Scheme `(a . b)`.
	 *
	 * @returns La stringa formattata.
	 * @example
	 * ```typescript
	 * const c = new Coppia(Atomo.fromString('a'), Atomo.fromString('b'));
	 * c.toString(); // "(a . b)"
	 * ```
	 */
	toString(): string {
		function formatElemento(el: TipoElemento): string {
			if (el === null) {
				return '()';
			} else if (el instanceof Atomo) {
				return el.toString();
			} else if (Coppia.èCoppia(el)) {
				return el.toString();
			} else {
				return el.toString();
			}
		}

		const valPrimo = formatElemento(this._primo);
		const valResto = formatElemento(this._resto);
		return `(${valPrimo} . ${valResto})`;
	}

	/**
	 * Costruisce una `Coppia` effettuando l'analisi lessicale e il parsing di una stringa Scheme.
	 *
	 * @param s - Stringa in formato coppia Scheme (es. `"(1 . 2)"` o `"(a . (b . c))"`).
	 * @returns Istanza di `Coppia` corrispondente.
	 * @throws Error Se la stringa non è una sintassi di coppia valida.
	 * @example
	 * ```typescript
	 * const c = Coppia.fromString('(x . y)');
	 * ```
	 */
	static fromString(s: string): Coppia {
		const parole = analizzatoreLessicale(s).filter(
			(p: Parola) => p.tipo !== TipoDiParole.FineDelFile
		);
		if (parole.length === 0) {
			throw new Error('Stringa vuota, impossibile creare una Coppia.');
		}

		if (parole[0].tipo !== TipoDiParole.ParentesiAperta) {
			throw new Error('Una coppia deve iniziare con una parentesi aperta.');
		}

		const pos = { index: 1 }; // Salta la prima '('
		return Coppia._parseTokens(parole, pos);
	}

	/**
	 * Helper privato per il parsing ricorsivo dei token e la costruzione della coppia.
	 */
	private static _parseTokens(parole: Parola[], pos: { index: number }): Coppia {
		function tokenToElemento(token: Parola): TipoElemento {
			switch (token.tipo) {
				case TipoDiParole.Numero:
					return new Atomo(token.valore as number, TipoAtomo.NUMERO);
				case TipoDiParole.Booleano:
					return new Atomo(token.valore as boolean, TipoAtomo.BOOLEANO);
				case TipoDiParole.Stringa:
					return new Atomo(token.valore as string, TipoAtomo.STRINGA);
				case TipoDiParole.Simbolo:
					return new Atomo(token.valore as string, TipoAtomo.SIMBOLO);
				default:
					return token.valore === null ? null : new Atomo(String(token.valore), TipoAtomo.SIMBOLO);
			}
		}

		if (pos.index >= parole.length) {
			throw new Error('Coppia non valida: fine inattesa dei token.');
		}

		let pPrimo: TipoElemento;
		const token1 = parole[pos.index];
		pos.index++;

		if (token1.tipo === TipoDiParole.ParentesiAperta) {
			pPrimo = Coppia._parseTokens(parole, pos);
		} else {
			pPrimo = tokenToElemento(token1);
		}

		if (pos.index < parole.length && parole[pos.index].valore === '.') {
			pos.index++;
		}

		if (pos.index >= parole.length) {
			throw new Error('Coppia non valida: manca il resto dopo il separatore.');
		}

		let pResto: TipoElemento;
		const token2 = parole[pos.index];
		pos.index++;

		if (token2.tipo === TipoDiParole.ParentesiAperta) {
			pResto = Coppia._parseTokens(parole, pos);
		} else {
			pResto = tokenToElemento(token2);
		}

		if (pos.index < parole.length && parole[pos.index].tipo === TipoDiParole.ParentesiChiusa) {
			pos.index++;
		} else {
			throw new Error('Coppia non valida: manca la parentesi chiusa finale.');
		}

		return new Coppia(pPrimo, pResto);
	}
}
