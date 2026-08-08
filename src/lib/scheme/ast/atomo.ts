// file: src/lib/scheme/ast/atomo.ts
/**
 * Modulo per la rappresentazione e gestione dei valori atomici in Scheme.
 *
 * Gli atomi rappresentano la struttura dati elementare del linguaggio:
 * numeri, booleani, stringhe e simboli. Contiene anche l'utility `fromString`
 * per la deserializzazione dal formato testuale Scheme.
 *
 * @module ast/atomo
 * @example
 * ```typescript
 * import { Atomo, TipoAtomo } from './atomo';
 *
 * const a = Atomo.fromString('42');
 * console.log(a.tipo); // TipoAtomo.NUMERO
 * console.log(a.valore); // 42
 * console.log(a.toString()); // "42"
 * ```
 */

/**
 * Enumerazione dei tipi semantici degli atomi Scheme.
 */
export enum TipoAtomo {
	/** Valore numerico (intero o reale) */
	NUMERO = 'NUMERO',
	/** Valore booleano (#t / #f) */
	BOOLEANO = 'BOOLEANO',
	/** Stringa di testo letterale */
	STRINGA = 'STRINGA',
	/** Identificatore / simbolo Scheme */
	SIMBOLO = 'SIMBOLO'
}

/**
 * Rappresenta un valore atomico in Scheme con il suo valore primitivo e il relativo tipo semantico.
 *
 * @example
 * ```typescript
 * const atomoNum = new Atomo(100, TipoAtomo.NUMERO);
 * const atomoSym = new Atomo('fattoriale', TipoAtomo.SIMBOLO);
 * ```
 */
export class Atomo {
	private readonly _valore: number | boolean | string;
	private readonly _tipo: TipoAtomo;

	/**
	 * Crea un nuovo atomo con il valore specificato e il relativo tipo.
	 *
	 * @param valore - Valore primitivo incapsulato dall'atomo.
	 * @param tipo - Tipo semantico dell'atomo.
	 */
	constructor(valore: number | boolean | string, tipo: TipoAtomo) {
		this._valore = valore;
		this._tipo = tipo;
	}

	/**
	 * Restituisce il valore atomico memorizzato.
	 */
	get valore(): number | boolean | string {
		return this._valore;
	}

	/**
	 * Restituisce il tipo semantico dell'atomo.
	 */
	get tipo(): TipoAtomo {
		return this._tipo;
	}

	/**
	 * Verifica se un generico valore JavaScript è un tipo atomico supportato (number, boolean o string).
	 *
	 * @param a - Valore da verificare.
	 * @returns `true` se il valore è un numero, un booleano o una stringa.
	 * @example
	 * ```typescript
	 * Atomo.èValoreAtomico(42); // true
	 * Atomo.èValoreAtomico({}); // false
	 * ```
	 */
	static èValoreAtomico(a: unknown): a is number | boolean | string {
		return typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean';
	}

	/**
	 * Parsing helper per istanziare un `Atomo` a partire dalla sua rappresentazione testuale Scheme.
	 *
	 * @param s - Stringa da interpretare (es. `"#t"`, `"42"`, `"\"testo\""`, `"simbolo"`).
	 * @returns Oggetto `Atomo` con tipo e valore inferiti.
	 * @example
	 * ```typescript
	 * const boolAtom = Atomo.fromString('#t'); // TipoAtomo.BOOLEANO, valore: true
	 * const strAtom = Atomo.fromString('"ciao"'); // TipoAtomo.STRINGA, valore: "ciao"
	 * ```
	 */
	static fromString(s: string): Atomo {
		const sTrimmed = s.trim();

		if (
			sTrimmed === '#t' ||
			sTrimmed === '#true' ||
			sTrimmed === 'true' ||
			sTrimmed === 'vero' ||
			sTrimmed === '#vero'
		) {
			return new Atomo(true, TipoAtomo.BOOLEANO);
		}
		if (
			sTrimmed === '#f' ||
			sTrimmed === '#false' ||
			sTrimmed === 'false' ||
			sTrimmed === 'falso' ||
			sTrimmed === '#falso'
		) {
			return new Atomo(false, TipoAtomo.BOOLEANO);
		}

		if (sTrimmed !== '' && !isNaN(Number(sTrimmed)) && isFinite(Number(sTrimmed))) {
			return new Atomo(Number(sTrimmed), TipoAtomo.NUMERO);
		}

		if (sTrimmed.startsWith('"') && sTrimmed.endsWith('"')) {
			return new Atomo(sTrimmed.slice(1, -1), TipoAtomo.STRINGA);
		}

		return new Atomo(sTrimmed, TipoAtomo.SIMBOLO);
	}

	/**
	 * Restituisce la rappresentazione testuale dell'atomo nel formato standard Scheme.
	 *
	 * @returns La stringa rappresentativa (es. `"42"`, `"#t"`, `"\"testo\""`).
	 * @example
	 * ```typescript
	 * new Atomo(true, TipoAtomo.BOOLEANO).toString(); // "#t"
	 * new Atomo("abc", TipoAtomo.STRINGA).toString(); // "\"abc\""
	 * ```
	 */
	toString(): string {
		switch (this._tipo) {
			case TipoAtomo.NUMERO:
				return String(this._valore);
			case TipoAtomo.BOOLEANO:
				return this._valore ? '#t' : '#f';
			case TipoAtomo.STRINGA:
				return String('"' + String(this._valore) + '"');
			case TipoAtomo.SIMBOLO:
				return String(this._valore);
		}
	}
}
