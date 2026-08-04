import { Lista } from './lista';
import { Coppia } from './coppia';
import { Atomo } from './atomo';

/**
 * Definisce i nodi dell'Abstract Syntax Tree (AST) usati per rappresentare programmi Scheme.
 *
 * Le classi astratte e concrete descrivono espressioni atomiche, liste e forme speciali.
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
 * Nodo base dell'AST: ogni espressione Scheme implementa questo contratto.
 */
export abstract class NodoAST {
    abstract accetta<R>(visitor: VisitorAST<R>): R;
}

// ==========================================
// 0. PROGRAMMA
// ==========================================
/**
 * Rappresenta un programma Scheme, ovvero una sequenza ordinata di forme.
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

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaProgramma(this);
    }
}

// ==========================================
// 1. ATOMO
// ==========================================
/**
 * Rappresenta un valore atomico, come un numero, un booleano o un simbolo.
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

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaAtomo(this);
    }
}

// ==========================================
// 2. CITAZIONE (Quote: 'expr o (quote expr))
// ==========================================
/**
 * Rappresenta una citazione, ovvero un'espressione che deve essere trattata come dati.
 */
export class CitazioneAST extends NodoAST {
    /**
     * Crea una nuova citazione.
     *
     * @param espressione - Espressione che viene citata.
     */
    constructor(public espressione: NodoAST | Atomo | Lista | Coppia) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaCitazione(this);
    }
}

// ==========================================
// 3. LISTA (Applicazione di funzione o lista generica)
// ==========================================
/**
 * Rappresenta una lista di espressioni, ad esempio un'applicazione o una struttura dati.
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

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaLista(this);
    }
}

// ==========================================
// 4. FORME SPECIALI (Classe astratta e concrete)
// ==========================================
/**
 * Base comune per tutte le forme speciali di Scheme.
 */
export abstract class FormaSpecialeAST extends NodoAST {}

// --- DEFINE ---
/**
 * Rappresenta una definizione di variabile o funzione.
 */
export class DefineAST extends FormaSpecialeAST {
    /**
     * Crea una nuova definizione.
     *
     * @param nome - Nome della variabile o della funzione.
     * @param valore - Espressione assegnata al nome.
     */
    constructor(
        public nome: AtomoAST,
        public valore: NodoAST
    ) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaDefine(this);
    }
}

// --- LAMBDA ---
/**
 * Rappresenta una funzione anonima Scheme con parametri e corpo.
 */
export class LambdaAST extends FormaSpecialeAST {
    /**
     * Crea un nuovo nodo lambda.
     *
     * @param parametri - Parametri formali della funzione.
     * @param corpo - Sequenza di forme che costituiscono il corpo.
     */
    constructor(
        public parametri: AtomoAST[],
        public corpo: NodoAST[]
    ) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaLambda(this);
    }
}

// --- APPLICAZIONE ---
/**
 * Rappresenta un'applicazione di funzione: operatore seguito da argomenti.
 */
export class ApplicazioneAST extends NodoAST {
    /**
     * Crea una nuova applicazione.
     *
     * @param operatore - Nodo che rappresenta la funzione da applicare.
     * @param argomenti - Argomenti passati all'operatore.
     */
    constructor(
        public operatore: NodoAST,
        public argomenti: NodoAST[]
    ) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaApplicazione(this);
    }
}

// --- IF ---
/**
 * Rappresenta una forma condizionale if.
 */
export class IfAST extends FormaSpecialeAST {
    /**
     * Crea un nuovo nodo if.
     *
     * @param condizione - Esprssione booleana di controllo.
     * @param ramoThen - Ramificazione eseguita se la condizione è vera.
     * @param ramoElse - Ramificazione eseguita se la condizione è falsa.
     */
    constructor(
        public condizione: NodoAST,
        public ramoThen: NodoAST,
        public ramoElse: NodoAST
    ) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaIf(this);
    }
}

// --- AND ---
/**
 * Rappresenta una forma logica and.
 */
export class AndAST extends FormaSpecialeAST {
    /**
     * Crea un nuovo nodo and.
     *
     * @param espressioni - Elenco delle espressioni valutate in sequenza.
     */
    constructor(public espressioni: NodoAST[]) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaAnd(this);
    }
}

// --- OR ---
/**
 * Rappresenta una forma logica or.
 */
export class OrAST extends FormaSpecialeAST {
    /**
     * Crea un nuovo nodo or.
     *
     * @param espressioni - Elenco delle espressioni valutate in sequenza.
     */
    constructor(public espressioni: NodoAST[]) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaOr(this);
    }
}

// --- COND ---
/**
 * Descrive una singola clausola di una forma cond.
 */
export interface ClausolaCond {
    condizione: NodoAST;
    conseguenti: NodoAST[];
}

/**
 * Rappresenta una forma cond con una lista di clausole.
 */
export class CondAST extends FormaSpecialeAST {
    /**
     * Crea un nuovo nodo cond.
     *
     * @param clausole - Clausole della forma cond.
     */
    constructor(public clausole: ClausolaCond[]) {
        super();
    }

    /**
     * Accetta un visitatore e delega l'elaborazione al metodo appropriato.
     *
     * @param visitor - Visitor che processa il nodo.
     * @returns Il risultato dell'elaborazione.
     */
    accetta<R>(visitor: VisitorAST<R>): R {
        return visitor.visitaCond(this);
    }
}