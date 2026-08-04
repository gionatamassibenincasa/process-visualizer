import { Atomo, TipoAtomo } from './atomo';
import { TipoDiParole } from '../lexer/token';
import type { Parola } from '../lexer/token';
import { analizzatoreLessicale } from '../lexer/lexer';
import type { Lista } from './lista';

/**
 * Definisce il tipo di elemento che può comparire in una coppia Scheme.
 *
 * Un elemento può essere un atomo, un'altra coppia (struttura annidata) oppure nullo.
 */
export type TipoElemento = Atomo | Coppia | Lista | null;

/**
 * Rappresenta una coppia Scheme (dotted pair) composta da primo elemento e resto.
 *
 * La classe supporta sia la serializzazione in formato Scheme sia il parsing da stringa.
 */
export class Coppia {
	private readonly _primo: TipoElemento;
	private readonly _resto: TipoElemento;

	/**
	 * Crea una nuova coppia.
	 *
	 * @param primo - Primo elemento della coppia.
	 * @param resto - Elemento restante della coppia.
	 */
	constructor(primo: TipoElemento, resto: TipoElemento) {
		this._primo = primo;
		this._resto = resto;
	}

	/**
	 * Restituisce il primo elemento della coppia.
	 */
	get primo(): TipoElemento {
		return this._primo;
	}

	/**
	 * Restituisce il resto della coppia.
	 */
	get resto(): TipoElemento {
		return this._resto;
	}

	/**
	 * Verifica se un valore è un'istanza valida di Coppia.
	 *
	 * @param a - Valore da verificare.
	 * @returns True se il valore è una coppia.
	 */
	static èCoppia(a: unknown): a is Coppia {
		return a instanceof Coppia;
	}

	/**
	 * Restituisce la rappresentazione testuale della coppia nel formato dotted pair.
	 *
	 * @returns Stringa in formato Scheme, ad esempio (a . b).
	 */
	toString(): string {
		/**
		 * Converte un singolo elemento della coppia in formato testuale Scheme.
		 *
		 * @param el - Elemento da formattare.
		 * @returns Rappresentazione testuale dell'elemento.
		 */
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
		// if (this._resto === null) {
		//     return `(${valPrimo})`;
		// }
		return `(${valPrimo} . ${valResto})`;
	}

	/**
	 * Crea una coppia a partire da una stringa in sintassi Scheme.
	 *
	 * @param s - Stringa da interpretare.
	 * @returns Coppia corrispondente all'input.
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
	 * Effettua il parsing ricorsivo dei token e costruisce la struttura annidata di coppie.
	 *
	 * @param parole - Sequenza di token lessicali.
	 * @param pos - Posizione corrente nel parsing.
	 * @returns Coppia costruita dai token letti.
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

		// Legge il primo elemento
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

		// Ci aspettiamo il punto '.' che separa il primo dal resto in una dotted pair
		if (pos.index < parole.length && parole[pos.index].valore === '.') {
			pos.index++; // Salta il punto
		}

		// Legge il resto
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

		// Ci aspettiamo la chiusura della parentesi ')'
		if (pos.index < parole.length && parole[pos.index].tipo === TipoDiParole.ParentesiChiusa) {
			pos.index++;
		} else {
			throw new Error('Coppia non valida: manca la parentesi chiusa finale.');
		}

		return new Coppia(pPrimo, pResto);
	}
}
