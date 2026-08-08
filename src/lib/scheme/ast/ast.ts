// file: src/lib/scheme/ast/ast.ts
/**
 * Modulo di definizione dell'Abstract Syntax Tree (AST) per il linguaggio Scheme.
 *
 * Contiene la gerarchia di classi astratte e concrete usate per rappresentare
 * le espressioni del linguaggio (atomi, citazioni, liste e forme speciali come `define`, `if`, `lambda`).
 * Implementa il pattern Visitor attraverso l'interfaccia `VisitorAST`.
 *
 * @module ast/ast
 * @example
 * ```typescript
 * import { ProgrammaAST, ApplicazioneAST, AtomoAST } from './ast';
 *
 * const app = new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST(1), new AtomoAST(2)]);
 * const prog = new ProgrammaAST([app]);
 * ```
 */

import { Lista } from './lista';
import { Coppia } from './coppia';
import { Atomo } from './atomo';

/**
 * Interfaccia per il pattern Visitor sugli elementi dell'AST Scheme.
 *
 * Consente di implementare operazioni generiche (come la formattazione, la valutazione o la trasformazione)
 * senza accoppiare la logica alle singole classi AST.
 *
 * @typeParam R - Tipo restituito dai metodi del visitatore.
 * @example
 * ```typescript
 * class StampanteAST implements VisitorAST<string> {
 *   visitaProgramma(nodo: ProgrammaAST) { return nodo.forme.map(f => f.accetta(this)).join('\n'); }
 *   visitaAtomo(nodo: AtomoAST) { return String(nodo.valore); }
 *   // ... altri metodi
 * }
 * ```
 */
export interface VisitorAST<R> {
	visitaProgramma(nodo: ProgrammaAST): R;
	visitaAtomo(nodo: AtomoAST): R;
	visitaCitazione(nodo: CitazioneAST): R;
	visitaLista(nodo: ListaAST): R;
	visitaDefine(nodo: DefineAST): R;
	visitaLambda(nodo: LambdaAST): R;
	visitaApplicazione(nodo: ApplicazioneAST): R;
	visitaIf(nodo: IfAST): R;
	visitaAnd(nodo: AndAST): R;
	visitaOr(nodo: OrAST): R;
	visitaCond(nodo: CondAST): R;
}

/**
 * Nodo base astratto dell'AST: ogni espressione Scheme eredita da questa classe.
 */
export abstract class NodoAST {
	/**
	 * Accetta un visitatore e delega l'elaborazione al metodo specifico della sottoclasse.
	 *
	 * @param visitor - Il visitatore che processa il nodo.
	 * @returns Il risultato dell'elaborazione.
	 */
	abstract accetta<R>(visitor: VisitorAST<R>): R;
}

// ==========================================
// 0. PROGRAMMA
// ==========================================
/**
 * Rappresenta un programma Scheme, composto da una sequenza ordinata di forme top-level.
 *
 * @example
 * ```typescript
 * const programma = new ProgrammaAST([
 *   new DefineAST(new AtomoAST('x'), new AtomoAST(10)),
 *   new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST('x'), new AtomoAST(5)])
 * ]);
 * ```
 */
export class ProgrammaAST extends NodoAST {
	/**
	 * Crea un nuovo programma contenente una sequenza di forme.
	 *
	 * @param forme - Forme top-level del programma.
	 */
	constructor(public forme: NodoAST[]) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaProgramma(this);
	}
}

// ==========================================
// 1. ATOMO
// ==========================================
/**
 * Rappresenta un valore atomico, come un numero, un booleano, una stringa o un simbolo.
 *
 * @example
 * ```typescript
 * const atomoNum = new AtomoAST(42);
 * const atomoSimbolo = new AtomoAST('pippo');
 * const atomoBool = new AtomoAST(true);
 * ```
 */
export class AtomoAST extends NodoAST {
	/**
	 * Crea un nuovo nodo atomico.
	 *
	 * @param valore - Valore atomico associato al nodo.
	 */
	constructor(public valore: string | number | boolean | symbol) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaAtomo(this);
	}
}

// ==========================================
// 2. CITAZIONE (Quote: 'expr o (quote expr))
// ==========================================
/**
 * Rappresenta una citazione (quote), ovvero un'espressione trattata come dato letterale.
 *
 * @example
 * ```typescript
 * const quote = new CitazioneAST(new AtomoAST('simbolo'));
 * ```
 */
export class CitazioneAST extends NodoAST {
	/**
	 * Crea una nuova citazione.
	 *
	 * @param espressione - Espressione o struttura dati citata.
	 */
	constructor(public espressione: NodoAST | Atomo | Lista | Coppia) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaCitazione(this);
	}
}

// ==========================================
// 3. LISTA (Applicazione di funzione o lista generica)
// ==========================================
/**
 * Rappresenta una lista di espressioni nell'AST.
 *
 * @example
 * ```typescript
 * const lista = new ListaAST([new AtomoAST(1), new AtomoAST(2)]);
 * ```
 */
export class ListaAST extends NodoAST {
	/**
	 * Crea una nuova lista AST.
	 *
	 * @param elementi - Elementi contenuti nella lista.
	 */
	constructor(public elementi: NodoAST[]) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaLista(this);
	}
}

// ==========================================
// 4. FORME SPECIALI (Classe astratta e concrete)
// ==========================================
/**
 * Base comune astratta per le forme speciali di Scheme (`define`, `if`, `lambda`, `cond`, ecc.).
 */
export abstract class FormaSpecialeAST extends NodoAST {}

// --- DEFINE ---
/**
 * Rappresenta la forma speciale `define` per la definizione di variabili o funzioni.
 *
 * @example
 * ```typescript
 * // (define x 10)
 * const def = new DefineAST(new AtomoAST('x'), new AtomoAST(10));
 * ```
 */
export class DefineAST extends FormaSpecialeAST {
	/**
	 * Crea una nuova definizione.
	 *
	 * @param nome - Nome del simbolo definito.
	 * @param valore - Espressione associata al nome.
	 */
	constructor(
		public nome: AtomoAST,
		public valore: NodoAST
	) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaDefine(this);
	}
}

// --- LAMBDA ---
/**
 * Rappresenta una funzione anonima Scheme con parametri e corpo.
 *
 * @example
 * ```typescript
 * // (lambda (x y) (+ x y))
 * const lambda = new LambdaAST(
 *   [new AtomoAST('x'), new AtomoAST('y')],
 *   [new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST('x'), new AtomoAST('y')])]
 * );
 * ```
 */
export class LambdaAST extends FormaSpecialeAST {
	/**
	 * Crea un nuovo nodo lambda.
	 *
	 * @param parametri - Parametri formali della funzione.
	 * @param corpo - Sequenza di espressioni nel corpo della lambda.
	 */
	constructor(
		public parametri: AtomoAST[],
		public corpo: NodoAST[]
	) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaLambda(this);
	}
}

// --- APPLICAZIONE ---
/**
 * Rappresenta un'applicazione di funzione (operatore applicato agli argomenti).
 *
 * @example
 * ```typescript
 * // (+ 10 20)
 * const app = new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST(10), new AtomoAST(20)]);
 * ```
 */
export class ApplicazioneAST extends NodoAST {
	/**
	 * Crea una nuova applicazione.
	 *
	 * @param operatore - Nodo che rappresenta l'operatore da valutare ed eseguire.
	 * @param argomenti - Elenco delle espressioni usate come argomenti.
	 */
	constructor(
		public operatore: NodoAST,
		public argomenti: NodoAST[]
	) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaApplicazione(this);
	}
}

// --- IF ---
/**
 * Rappresenta la forma condizionale `if`.
 *
 * @example
 * ```typescript
 * // (if (> x 0) 1 -1)
 * const ifNodo = new IfAST(
 *   new ApplicazioneAST(new AtomoAST('>'), [new AtomoAST('x'), new AtomoAST(0)]),
 *   new AtomoAST(1),
 *   new AtomoAST(-1)
 * );
 * ```
 */
export class IfAST extends FormaSpecialeAST {
	/**
	 * Crea un nuovo nodo if.
	 *
	 * @param condizione - Espressione condizionale di controllo.
	 * @param ramoThen - Espressione eseguita se la condizione è vera.
	 * @param ramoElse - Espressione eseguita se la condizione è falsa.
	 */
	constructor(
		public condizione: NodoAST,
		public ramoThen: NodoAST,
		public ramoElse: NodoAST
	) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaIf(this);
	}
}

// --- AND ---
/**
 * Rappresenta la forma logica con valutazione in cortocircuito `and`.
 *
 * @example
 * ```typescript
 * // (and #t #f)
 * const andNodo = new AndAST([new AtomoAST(true), new AtomoAST(false)]);
 * ```
 */
export class AndAST extends FormaSpecialeAST {
	/**
	 * Crea un nuovo nodo and.
	 *
	 * @param espressioni - Sequenza di espressioni da valutare in ordine.
	 */
	constructor(public espressioni: NodoAST[]) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaAnd(this);
	}
}

// --- OR ---
/**
 * Rappresenta la forma logica con valutazione in cortocircuito `or`.
 *
 * @example
 * ```typescript
 * // (or #f #t)
 * const orNodo = new OrAST([new AtomoAST(false), new AtomoAST(true)]);
 * ```
 */
export class OrAST extends FormaSpecialeAST {
	/**
	 * Crea un nuovo nodo or.
	 *
	 * @param espressioni - Sequenza di espressioni da valutare in ordine.
	 */
	constructor(public espressioni: NodoAST[]) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaOr(this);
	}
}

// --- COND ---
/**
 * Descrive una singola clausola contenuta in una forma condizionale `cond`.
 */
export interface ClausolaCond {
	/** Espressione condizionale della clausola. */
	condizione: NodoAST;
	/** Sequenza dei conseguenti da eseguire se la condizione è vera. */
	conseguenti: NodoAST[];
}

/**
 * Rappresenta la forma speciale condizionale a più ramificazioni `cond`.
 *
 * @example
 * ```typescript
 * // (cond ((zero? x) 0) (else 1))
 * const condNodo = new CondAST([
 *   { condizione: new ApplicazioneAST(new AtomoAST('zero?'), [new AtomoAST('x')]), conseguenti: [new AtomoAST(0)] },
 *   { condizione: new AtomoAST('else'), conseguenti: [new AtomoAST(1)] }
 * ]);
 * ```
 */
export class CondAST extends FormaSpecialeAST {
	/**
	 * Crea un nuovo nodo cond.
	 *
	 * @param clausole - Clausole condizionali ordinatamente valutate.
	 */
	constructor(public clausole: ClausolaCond[]) {
		super();
	}

	accetta<R>(visitor: VisitorAST<R>): R {
		return visitor.visitaCond(this);
	}
}
