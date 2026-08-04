import { analizzatoreLessicale, type Parola, TipoDiParole } from '../lexer/lexer';
import { Atomo, TipoAtomo } from './atomo';
import { Coppia } from './coppia';
import { Lista } from './lista';
import {
	ApplicazioneAST,
	AndAST,
	AtomoAST,
	CitazioneAST,
	CondAST,
	DefineAST,
	IfAST,
	LambdaAST,
	NodoAST,
	OrAST,
	ProgrammaAST,
} from './ast';
import type { ClausolaCond } from './ast';

type DatumValue = Atomo | Lista | Coppia;

/**
 * Parser ricorsivo-discendente per il sottoinsieme Scheme definito in grammar.md.
 */
export class ParserScheme {
	private readonly tokens: Parola[];
	private current: number = 0;

	/**
	 * Crea un parser a partire dalla lista di token lessicali.
	 *
	 * @param tokens - Token prodotti dal lexer.
	 */
	constructor(tokens: Parola[]) {
		this.tokens = tokens;
	}

	/**
	 * Esegue il parsing del programma completo.
	 *
	 * @returns Nodo Programma contenente tutte le forme top-level.
	 */
	parseProgramma(): ProgrammaAST {
		const forme: NodoAST[] = [];
		while (!this.isAtEnd()) {
			forme.push(this.parseForma());
		}
		return new ProgrammaAST(forme);
	}

	private parseForma(): NodoAST {
		return this.parseEspressione();
	}

	private parseEspressione(): NodoAST {
		const token = this.peek();

		if (token.tipo === TipoDiParole.Citazione) {
			this.advance();
			const datum = this.parseDatum();
			return new CitazioneAST(datum);
		}

		if (token.tipo === TipoDiParole.ParentesiAperta) {
			return this.parseListaComeEspressione();
		}

		return this.parseAtomo();
	}

	private parseListaComeEspressione(): NodoAST {
		this.consume(TipoDiParole.ParentesiAperta, 'Attesa parentesi aperta.');

		if (this.check(TipoDiParole.ParentesiChiusa)) {
			this.advance();
			return new ApplicazioneAST(new AtomoAST('list'), []);
		}

		if (this.check(TipoDiParole.Simbolo)) {
			const simbolo = String(this.peek().valore);

			if (simbolo === 'define' || simbolo === 'definisci') {
				this.advance();
				return this.parseDefine();
			}
			if (simbolo === 'quote' || simbolo === 'cita') {
				this.advance();
				return this.parseQuoteCompleta();
			}
			if (simbolo === 'lambda') {
				this.advance();
				return this.parseLambda();
			}
			if (simbolo === 'if' || simbolo === 'se') {
				this.advance();
				return this.parseIf();
			}
			if (simbolo === 'and' || simbolo === 'e') {
				this.advance();
				return this.parseAnd();
			}
			if (simbolo === 'or' || simbolo === 'o') {
				this.advance();
				return this.parseOr();
			}
			if (simbolo === 'cond') {
				this.advance();
				return this.parseCond();
			}
		}

		const operatore = this.parseEspressione();
		const argomenti: NodoAST[] = [];
		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
			argomenti.push(this.parseEspressione());
		}
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa a fine applicazione.');
		return new ApplicazioneAST(operatore, argomenti);
	}

	private parseDefine(): NodoAST {
		const nome = this.parseAtomo();
		if (!(nome instanceof AtomoAST) || typeof nome.valore !== 'string') {
			throw this.error(this.peek(), 'Il nome in define deve essere un simbolo.');
		}
		const valore = this.parseEspressione();
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo define.');
		return new DefineAST(nome, valore);
	}

	private parseQuoteCompleta(): NodoAST {
		const datum = this.parseDatum();
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo quote/cita.');
		return new CitazioneAST(datum);
	}

	private parseLambda(): NodoAST {
		this.consume(TipoDiParole.ParentesiAperta, 'Attesa lista parametri per lambda.');
		const parametri: AtomoAST[] = [];
		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
			const parametro = this.parseAtomo();
			if (!(parametro instanceof AtomoAST) || typeof parametro.valore !== 'string') {
				throw this.error(this.peek(), 'I parametri lambda devono essere simboli.');
			}
			parametri.push(parametro);
		}
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa chiusura lista parametri lambda.');

		const corpo: NodoAST[] = [];
		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
			corpo.push(this.parseForma());
		}

		if (corpo.length === 0) {
			throw this.error(this.peek(), 'Il corpo lambda non puo essere vuoto.');
		}

		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo lambda.');
		return new LambdaAST(parametri, corpo);
	}

	private parseIf(): NodoAST {
		const condizione = this.parseEspressione();
		const ramoThen = this.parseEspressione();
		const ramoElse = this.check(TipoDiParole.ParentesiChiusa) ? new AtomoAST(false) : this.parseEspressione();
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo if.');
		return new IfAST(condizione, ramoThen, ramoElse);
	}

	private parseAnd(): NodoAST {
		const espressioni: NodoAST[] = [];
		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
			espressioni.push(this.parseEspressione());
		}
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo and.');
		return new AndAST(espressioni);
	}

	private parseOr(): NodoAST {
		const espressioni: NodoAST[] = [];
		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
			espressioni.push(this.parseEspressione());
		}
		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo or.');
		return new OrAST(espressioni);
	}

	private parseCond(): NodoAST {
		const clausole: ClausolaCond[] = [];

		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
			this.consume(TipoDiParole.ParentesiAperta, 'Attesa apertura clausola cond.');
			const condizione = this.parseEspressione();
			const conseguenti: NodoAST[] = [];
			while (!this.check(TipoDiParole.ParentesiChiusa) && !this.isAtEnd()) {
				conseguenti.push(this.parseEspressione());
			}
			this.consume(TipoDiParole.ParentesiChiusa, 'Attesa chiusura clausola cond.');

			if (conseguenti.length === 0) {
				throw this.error(this.peek(), 'Ogni clausola cond deve avere almeno un conseguente.');
			}

			clausole.push({ condizione, conseguenti });
		}

		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo cond.');
		return new CondAST(clausole);
	}

	private parseAtomo(): AtomoAST {
		const token = this.advance();
		switch (token.tipo) {
			case TipoDiParole.Booleano:
			case TipoDiParole.Numero:
			case TipoDiParole.Stringa:
				return new AtomoAST(token.valore as string | number | boolean);
			case TipoDiParole.Simbolo: {
				const simbolo = String(token.valore);

				// Alias utili in cond: else/altrimenti sono normalizzati a #t.
				if (simbolo === 'else' || simbolo === 'altrimenti') {
					return new AtomoAST(true);
				}

				return new AtomoAST(simbolo);
			}
			default:
				throw this.error(token, `Token inatteso '${String(token.valore)}' nel parsing di un atomo.`);
		}
	}

	private parseDatum(): DatumValue {
		const token = this.peek();

		if (token.tipo === TipoDiParole.Citazione) {
			this.advance();
			return this.parseDatum();
		}

		if (token.tipo === TipoDiParole.ParentesiAperta) {
			return this.parseDatumList();
		}

		return this.tokenToRuntimeAtomo(this.advance());
	}

	private parseDatumList(): Lista | Coppia {
		this.consume(TipoDiParole.ParentesiAperta, 'Attesa parentesi aperta nel datum lista.');

		if (this.check(TipoDiParole.ParentesiChiusa)) {
			this.advance();
			return Lista.listaVuota();
		}

		const elementi: DatumValue[] = [];
		while (!this.check(TipoDiParole.ParentesiChiusa) && !this.check(TipoDiParole.Punto) && !this.isAtEnd()) {
			const datum = this.parseDatum();
			if (datum instanceof Atomo || datum instanceof Lista || datum instanceof Coppia) {
				elementi.push(datum);
			} else {
				throw this.error(this.peek(), 'Il datum in lista citata deve essere Atomo, Lista o Coppia.');
			}
		}

		if (this.check(TipoDiParole.Punto)) {
			if (elementi.length === 0) {
				throw this.error(this.peek(), 'Una coppia puntata richiede almeno un elemento prima del punto.');
			}

			this.advance();
			const tail = this.parseDatum();
			this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo coppia puntata.');

			let result: DatumValue = this.assertDatumValue(tail);
			for (let i = elementi.length - 1; i >= 0; i--) {
				result = new Coppia(elementi[i], result);
			}
			return result as Coppia;
		}

		this.consume(TipoDiParole.ParentesiChiusa, 'Attesa parentesi chiusa dopo lista datum.');
		return new Lista(elementi);
	}

	private assertDatumValue(datum: DatumValue): DatumValue {
		if (datum instanceof Atomo || datum instanceof Lista || datum instanceof Coppia) {
			return datum;
		}
		throw this.error(this.peek(), 'Datum non valido nella coppia puntata.');
	}

	private tokenToRuntimeAtomo(token: Parola): Atomo {
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
				throw this.error(token, 'Token non convertibile in atomo runtime.');
		}
	}

	private match(...tipi: TipoDiParole[]): boolean {
		for (const tipo of tipi) {
			if (this.check(tipo)) {
				this.advance();
				return true;
			}
		}
		return false;
	}

	private consume(tipo: TipoDiParole, message: string): Parola {
		if (this.check(tipo)) {
			return this.advance();
		}
		throw this.error(this.peek(), message);
	}

	private check(tipo: TipoDiParole): boolean {
		if (this.isAtEnd()) {
			return false;
		}
		return this.peek().tipo === tipo;
	}

	private advance(): Parola {
		if (!this.isAtEnd()) {
			this.current++;
		}
		return this.previous();
	}

	private isAtEnd(): boolean {
		return this.peek().tipo === TipoDiParole.FineDelFile;
	}

	private peek(): Parola {
		return this.tokens[this.current];
	}

	private previous(): Parola {
		return this.tokens[this.current - 1];
	}

	private error(token: Parola, message: string): Error {
		return new SyntaxError(`${message} Token corrente: ${String(token.valore)} (${token.tipo}).`);
	}
}

/**
 * Esegue il parsing a partire dal codice sorgente Scheme.
 *
 * @param sorgente - Sorgente da analizzare.
 * @returns Programma AST completo.
 */
export function parseProgrammaDaSorgente(sorgente: string): ProgrammaAST {
	const tokens = analizzatoreLessicale(sorgente);
	return new ParserScheme(tokens).parseProgramma();
}
