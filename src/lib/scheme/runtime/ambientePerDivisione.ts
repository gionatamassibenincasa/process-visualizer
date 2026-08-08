// file: src/lib/scheme/runtime/ambientePerDivisione.ts
/**
 * Modulo dell'Ambiente per la Divisione (Naturali con Addizione, Sottrazione e Confronto).
 *
 * Configura un ambiente di calcolo specifico per gli algoritmi di divisione o aritmetica base,
 * fornendo le primitive `zero?`, `s`, `p`, `+`, `-`, e `<`.
 *
 * @module runtime/ambientePerDivisione
 * @example
 * ```typescript
 * import { creaAmbiente, profiloPerDivisione } from './ambientePerDivisione';
 *
 * const env = creaAmbiente();
 * console.log(env.applica('<')); // FunzionePrimitiva minore
 * ```
 */

import { Ambiente } from './ambiente';
import type { FunzionePrimitiva, ValoreScheme } from './valori';
import type { ProfiloAmbiente } from './profiloAmbiente';

function richiediNumero(valore: ValoreScheme, operatore: string): number {
	if (typeof valore !== 'number') {
		throw new Error(`'${operatore}' richiede argomenti numerici.`);
	}

	return valore;
}

function èZero(valore: ValoreScheme): boolean {
	return richiediNumero(valore, 'zero?') === 0;
}

function successore(valore: ValoreScheme): number {
	return richiediNumero(valore, 'successore') + 1;
}

function predecessore(valore: ValoreScheme): number {
	return richiediNumero(valore, 'predecessore') - 1;
}

function addizione(valore1: ValoreScheme, valore2: ValoreScheme): number {
	const num1 = richiediNumero(valore1, '+');
	const num2 = richiediNumero(valore2, '+');
	return num1 + num2;
}

function sottrazione(valore1: ValoreScheme, valore2: ValoreScheme): number {
	const num1 = richiediNumero(valore1, '-');
	const num2 = richiediNumero(valore2, '-');
	return num1 - num2;
}

function minore(valore1: ValoreScheme, valore2: ValoreScheme): boolean {
	const num1 = richiediNumero(valore1, '<');
	const num2 = richiediNumero(valore2, '<');
	return num1 < num2;
}

/**
 * Crea e restituisce un nuovo `Ambiente` popolato con le primitive per la divisione e l'aritmetica su naturali (`zero?`, `s`, `p`, `+`, `-`, `<`).
 *
 * @returns Istanza di {@link Ambiente}.
 * @example
 * ```typescript
 * const env = creaAmbiente();
 * ```
 */
export function creaAmbiente(): Ambiente<ValoreScheme> {
	const env = new Ambiente<ValoreScheme>();

	const èZeroPrimitiva: FunzionePrimitiva = èZero;
	const successorePrimitiva: FunzionePrimitiva = successore;
	const predecessorePrimitiva: FunzionePrimitiva = predecessore;
	const addizionePrimitiva: FunzionePrimitiva = addizione;
	const sottrazionePrimitiva: FunzionePrimitiva = sottrazione;
	const minorePrimitiva: FunzionePrimitiva = minore;

	env.inserisci('zero?', èZeroPrimitiva);
	env.inserisci('s', successorePrimitiva);
	env.inserisci('p', predecessorePrimitiva);
	env.inserisci('+', addizionePrimitiva);
	env.inserisci('-', sottrazionePrimitiva);
	env.inserisci('<', minorePrimitiva);

	return env;
}

/**
 * Profilo di ambiente per l'Ambiente per Divisione (`"nat-add-sot-min"`).
 */
export const profiloPerDivisione: ProfiloAmbiente = {
	id: 'nat-add-sot-min',
	nome: 'Numeri naturali',
	descrizione: 'Espone zero?, s, p, +, -, <.',

	crea(): Ambiente<ValoreScheme> {
		return creaAmbiente();
	}
};
