/**
 * Definisce i tipi e la classe utilizzati per rappresentare valori atomici di Scheme.
 *
 * Gli atomi sono i costituenti base dell'AST e vengono usati dal parser e dall'interprete.
 */
export enum TipoAtomo {
	NUMERO = 'NUMERO',
	BOOLEANO = 'BOOLEANO',
	STRINGA = 'STRINGA',
	SIMBOLO = 'SIMBOLO'
}

/**
 * Rappresenta un valore atomico di Scheme, come numero, booleano, stringa o simbolo.
 */
export class Atomo {
	private readonly _valore: number | boolean | string;
	private readonly _tipo: TipoAtomo;

	/**
	 * Crea un nuovo atomo con il valore specificato e il relativo tipo.
	 *
	 * @param valore - Valore atomico da incapsulare.
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
	 * Verifica se un valore è un atomo primitivo supportato.
	 *
	 * @param a - Valore da verificare.
	 * @returns True se il valore è un numero, un booleano o una stringa.
	 */
	static èValoreAtomico(a: unknown): a is number | boolean | string {
		return typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean';
	}

	/**
	 * Crea un atomo a partire da una stringa in formato Scheme o testo grezzo.
	 *
	 * @param s - Stringa da interpretare.
	 * @returns Un atomo corrispondente al valore riconosciuto.
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
	 * Restituisce una rappresentazione testuale dell'atomo in formato Scheme.
	 *
	 * @returns La stringa rappresentativa dell'atomo.
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
