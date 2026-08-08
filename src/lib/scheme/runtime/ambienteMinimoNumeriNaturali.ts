// file: src/lib/scheme/runtime/ambienteMinimoNumeriNaturali.ts
/**
 * Modulo dell'Ambiente Minimo per i Numeri Naturali per l'interprete Scheme.
 *
 * Espone un ambiente essenziale dedicato all'aritmetica sui numeri naturali Peano,
 * fornendo esclusivamente i predicati e le primitive minimali: `zero?`, `s` (successore) e `p` (predecessore).
 *
 * @module runtime/ambienteMinimoNumeriNaturali
 * @example
 * ```typescript
 * import { creaAmbiente, profiloMinimoNumeriNaturali } from './ambienteMinimoNumeriNaturali';
 *
 * const env = creaAmbiente();
 * console.log(env.applica('zero?')); // FunzionePrimitiva èZero
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

/**
 * Crea e restituisce un nuovo `Ambiente` contenente solo le primitive minimali dei numeri naturali (`zero?`, `s`, `p`).
 *
 * @returns Istanza di {@link Ambiente} configurata per i numeri naturali.
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

	env.inserisci('zero?', èZeroPrimitiva);
	env.inserisci('s', successorePrimitiva);
	env.inserisci('p', predecessorePrimitiva);

	return env;
}

/**
 * Profilo di ambiente per l'Ambiente Minimo Numeri Naturali (`"minimo-numeri-naturali"`).
 */
export const profiloMinimoNumeriNaturali: ProfiloAmbiente = {
	id: 'minimo-numeri-naturali',
	nome: 'Numeri naturali',
	descrizione: 'Espone solo zero?, s e p.',

	crea(): Ambiente<ValoreScheme> {
		return creaAmbiente();
	}
};
