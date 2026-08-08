// file: src/lib/scheme/runtime/valori.ts
/**
 * Tipi di dati di runtime per il linguaggio Scheme.
 *
 * Definisce i tipi di valore che possono essere memorizzati negli ambienti,
 * restituiti da funzioni o elaborati durante l'esecuzione dello stepper
 * (atomi, funzioni primitive, chiusure lambda, liste o null).
 *
 * @module runtime/valori
 * @example
 * ```typescript
 * import type { ValoreScheme, Chiusura } from './valori';
 *
 * const val: ValoreScheme = 42;
 * ```
 */

import { NodoAST } from '../ast/ast';
import type { Ambiente } from './ambiente';

/**
 * Tipi atomici primitivi Scheme supportati al runtime (numeri, booleani, stringhe).
 */
export type ValoreAtomicoScheme = number | boolean | string;

/**
 * Struttura di lista al runtime rappresentata come array di valori Scheme.
 */
export type ListaScheme = ValoreScheme[];

/**
 * Firma di una funzione primitiva Scheme implementata in TypeScript.
 *
 * @param args - Argomenti valutati e passati alla funzione primitiva.
 * @returns Il risultato dell'esecuzione della funzione primitiva.
 */
export type FunzionePrimitiva = (...args: ValoreScheme[]) => ValoreScheme;

/**
 * Rappresenta una chiusura di funzione (closure) creata da una forma `lambda`.
 * Incapsula l'elenco dei nomi dei parametri, le forme dell'AST del corpo e l'ambiente di definizione.
 *
 * @example
 * ```typescript
 * const chiusura: Chiusura = {
 *   parametri: ['x', 'y'],
 *   corpo: [astCorpo],
 *   ambienteChiusura: env
 * };
 * ```
 */
export interface Chiusura {
	/** Nomi dei parametri formali accettati dalla chiusura. */
	parametri: string[];
	/** Sequenza dei nodi AST che costituiscono il corpo della funzione. */
	corpo: NodoAST[];
	/** Ambiente di lexical scoping in cui la chiusura è stata creata. */
	ambienteChiusura: Ambiente<ValoreScheme>;
}

/**
 * Tipo unione generale per qualsiasi valore valido nel runtime dell'interprete Scheme.
 */
export type ValoreScheme = ValoreAtomicoScheme | FunzionePrimitiva | Chiusura | ListaScheme | null;
