import { expect, test } from 'vitest';
import { creaAmbiente } from './ambienteMinimoNumeriNaturali';
import type { FunzionePrimitiva, ValoreScheme } from './valori';

function applicaPrimitiva(nome: string, argomento: ValoreScheme): ValoreScheme {
	const valore = creaAmbiente().applica(nome);
	if (typeof valore !== 'function') {
		throw new Error(`'${nome}' non e una primitiva.`);
	}

	return (valore as FunzionePrimitiva)(argomento);
}

test('espone solo le primitive dei numeri naturali', () => {
	const ambiente = creaAmbiente();

	expect(ambiente.numElementi()).toBe(3);
	expect(applicaPrimitiva('zero?', 0)).toBe(true);
	expect(applicaPrimitiva('zero?', 1)).toBe(false);
	expect(applicaPrimitiva('s', 2)).toBe(3);
	expect(applicaPrimitiva('p', 2)).toBe(1);
	expect(() => ambiente.applica('+')).toThrow("Simbolo '+' non definito");
	expect(() => ambiente.applica('lista')).toThrow("Simbolo 'lista' non definito");
});
