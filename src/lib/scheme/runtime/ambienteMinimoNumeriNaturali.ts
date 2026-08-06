// file: runtime/ambienteMinimoNumeriNaturali.ts
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

export const profiloMinimoNumeriNaturali: ProfiloAmbiente = {
	id: 'minimo-numeri-naturali',
	nome: 'Numeri naturali',
	descrizione: 'Espone solo zero?, s e p.',

	crea(): Ambiente<ValoreScheme> {
		return creaAmbiente();
	}
};
