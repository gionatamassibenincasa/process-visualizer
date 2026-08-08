// file: src/lib/scheme/ast/lista.ts
/**
 * Modulo per la rappresentazione e manipolazione delle liste in Scheme.
 *
 * Le liste Scheme sono costruite ricorsivamente attraverso catene di coppie (`Coppia`),
 * dove la coda di ciascuna coppia si riferisce alla lista successiva fino a raggiungere la lista vuota (`null`).
 *
 * @module ast/lista
 * @example
 * ```typescript
 * import { Lista, lista } from './lista';
 * import { Atomo, TipoAtomo } from './atomo';
 *
 * const l = lista(new Atomo(1, TipoAtomo.NUMERO), new Atomo(2, TipoAtomo.NUMERO));
 * console.log(l.toString()); // "(1 2)"
 * ```
 */

import { TipoDiParole } from '../lexer/token';
import type { Parola } from '../lexer/token';
import { analizzatoreLessicale } from '../lexer/lexer';
import { Atomo, TipoAtomo } from './atomo';
import { Coppia } from './coppia';

/**
 * Tipo per gli elementi memorizzati all'interno di una lista Scheme.
 */
export type TipoElementoLista = null | Atomo | Coppia | Lista;

/**
 * Rappresenta una lista Scheme ricorsiva.
 *
 * Internamente implementata tramite nodi {@link Coppia}. Supporta liste vuote,
 * accesso posizionale (`preleva`), calcolo di `primo`/`resto` e parsing da stringa (`Lista.fromString`).
 *
 * @example
 * ```typescript
 * const l = Lista.fromString('(1 2 3)');
 * console.log(l.primo); // Atomo 1
 * console.log(l.resto.toString()); // "(2 3)"
 * ```
 */
export class Lista {
	private readonly _primaCoppia: Coppia | null;

	/**
	 * Costruisce una nuova lista Scheme da un array di elementi.
	 *
	 * @param elementi - Array degli elementi contenuti o `null` per creare una lista vuota.
	 */
	constructor(elementi: TipoElementoLista[] | null = null) {
		if (elementi === null || elementi.length === 0) {
			this._primaCoppia = null;
			return;
		}

		const [primo, ...resto] = elementi;
		this._primaCoppia = new Coppia(primo, new Lista(resto));
	}

	/**
	 * Factory per la creazione di una lista vuota `()`.
	 *
	 * @returns Istanza di `Lista` vuota.
	 * @example
	 * ```typescript
	 * const vuota = Lista.listaVuota();
	 * console.log(vuota.vuoto()); // true
	 * ```
	 */
	static listaVuota(): Lista {
		return new Lista(null);
	}

	/**
	 * Type guard per verificare se un oggetto generico è una `Lista`.
	 *
	 * @param valore - Oggetto da verificare.
	 * @returns `true` se l'oggetto è una `Lista`.
	 * @example
	 * ```typescript
	 * Lista.èLista(Lista.listaVuota()); // true
	 * Lista.èLista([1, 2]); // false
	 * ```
	 */
	static èLista(valore: unknown): valore is Lista {
		return valore instanceof Lista;
	}

	/**
	 * Restituisce il primo elemento (car) della lista.
	 */
	get primo(): TipoElementoLista | null {
		if (this._primaCoppia === null) {
			return null;
		}

		return this._primaCoppia.primo as TipoElementoLista;
	}

	/**
	 * Restituisce la coda (cdr) della lista.
	 */
	get resto(): Lista | null {
		if (this._primaCoppia === null) {
			return null;
		}

		return this._primaCoppia.resto as Lista;
	}

	/**
	 * Verifica se la lista è vuota `()`.
	 *
	 * @returns `true` se la lista non contiene elementi.
	 */
	vuoto(): boolean {
		return this._primaCoppia === null;
	}

	/**
	 * Restituisce l'elemento presente all'indice specificato (0-indexed).
	 *
	 * @param indice - Posizione dell'elemento da prelevare.
	 * @returns L'elemento corrispondente.
	 * @throws Error Se l'indice è negativo o fuori dai limiti della lista.
	 * @example
	 * ```typescript
	 * const l = Lista.fromString('(10 20 30)');
	 * console.log(l.preleva(1)); // Atomo 20
	 * ```
	 */
	preleva(indice: number): TipoElementoLista | null {
		if (indice < 0) {
			throw new Error("L'indice deve essere maggiore o uguale a zero.");
		}

		return this._prelevaRicorsivo(indice);
	}

	/**
	 * Restituisce la rappresentazione testuale in formato Scheme `(elem1 elem2 ...)`.
	 *
	 * @returns Stringa formattata.
	 * @example
	 * ```typescript
	 * new Lista([new Atomo(1, TipoAtomo.NUMERO)]).toString(); // "(1)"
	 * ```
	 */
	toString(): string {
		const elementi: string[] = [];
		this._accumulaElementi(elementi);

		return `(${elementi.join(' ')})`;
	}

	/**
	 * Effettua il parsing di una stringa e restituisce la corrispondente `Lista`.
	 *
	 * @param s - Stringa in formato lista Scheme (es. `"(1 2 3)"` o `"()"`).
	 * @returns Istanza di `Lista`.
	 * @throws Error Se la sintassi della stringa non è una lista valida.
	 * @example
	 * ```typescript
	 * const l = Lista.fromString('(a b c)');
	 * ```
	 */
	static fromString(s: string): Lista {
		const parole = analizzatoreLessicale(s).filter(
			(p: Parola) => p.tipo !== TipoDiParole.FineDelFile
		);
		if (parole.length === 0) {
			return Lista.listaVuota();
		}

		if (parole[0].tipo !== TipoDiParole.ParentesiAperta) {
			throw new Error(
				'La stringa non rappresenta una lista valida: manca la parentesi aperta iniziale.'
			);
		}

		const pos = { index: 1 };
		return Lista._parseTokens(parole, pos);
	}

	private static _formatElemento(elemento: TipoElementoLista | null): string {
		if (elemento === null) {
			return '()';
		}

		return elemento.toString();
	}

	private _prelevaRicorsivo(indice: number): TipoElementoLista | null {
		if (this.vuoto()) {
			throw new Error('Indice fuori dai limiti della lista.');
		}

		if (indice === 0) {
			return this.primo;
		}

		if (this.resto === null) {
			throw new Error('Indice fuori dai limiti della lista.');
		}

		return this.resto._prelevaRicorsivo(indice - 1);
	}

	private _accumulaElementi(elementi: string[]): void {
		if (this.vuoto()) {
			return;
		}

		elementi.push(Lista._formatElemento(this.primo));
		this.resto?._accumulaElementi(elementi);
	}

	private static _tokenToElemento(token: Parola): null | Atomo {
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

	private static _parseTokens(parole: Parola[], pos: { index: number }): Lista {
		const espressioni: TipoElementoLista[] = [];

		while (pos.index < parole.length) {
			const parola = parole[pos.index];
			pos.index++;

			if (parola.tipo === TipoDiParole.ParentesiChiusa) {
				return new Lista(espressioni);
			}

			if (parola.tipo === TipoDiParole.ParentesiAperta) {
				espressioni.push(Lista._parseTokens(parole, pos));
				continue;
			}

			espressioni.push(Lista._tokenToElemento(parola));
		}

		throw new Error('Sintassi della lista non valida: parentesi chiusa mancante.');
	}
}

/**
 * Utility function di comodo per creare una `Lista` vuota.
 *
 * @returns Lista vuota.
 * @example
 * ```typescript
 * const l = listaVuota();
 * ```
 */
export function listaVuota(): Lista {
	return Lista.listaVuota();
}

/**
 * Utility function di comodo variadica per istanziare una `Lista`.
 *
 * @param elementi - Elementi da inserire nella lista.
 * @returns Istanza di `Lista`.
 * @example
 * ```typescript
 * const l = lista(new Atomo(1, TipoAtomo.NUMERO), new Atomo(2, TipoAtomo.NUMERO));
 * ```
 */
export function lista(...elementi: TipoElementoLista[]): Lista {
	return new Lista(elementi);
}
