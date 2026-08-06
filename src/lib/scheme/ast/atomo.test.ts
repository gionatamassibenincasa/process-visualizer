import { expect, test } from 'vitest';
import { Atomo } from './atomo';

test('Atomo: parsing e rappresentazione', () => {
	const atomoNumero = Atomo.fromString('42');
	expect(atomoNumero.tipo).toBe('NUMERO');
	expect(atomoNumero.valore).toBe(42);
	expect(atomoNumero.toString()).toBe('42');

	const atomoBooleanoVero = Atomo.fromString('#t');
	expect(atomoBooleanoVero.tipo).toBe('BOOLEANO');
	expect(atomoBooleanoVero.valore).toBe(true);
	expect(atomoBooleanoVero.toString()).toBe('#t');

	const atomoBooleanoFalso = Atomo.fromString('#f');
	expect(atomoBooleanoFalso.tipo).toBe('BOOLEANO');
	expect(atomoBooleanoFalso.valore).toBe(false);
	expect(atomoBooleanoFalso.toString()).toBe('#f');

	const atomoStringaA = Atomo.fromString('"a"');
	expect(atomoStringaA.tipo).toBe('STRINGA');
	expect(atomoStringaA.valore).toBe('a');
	expect(atomoStringaA.toString()).toBe('"a"');

	const atomoStringa = Atomo.fromString('"testo"');
	expect(atomoStringa.tipo).toBe('STRINGA');
	expect(atomoStringa.valore).toBe('testo');
	expect(atomoStringa.toString()).toBe('"testo"');

	const atomoStringaVuota = Atomo.fromString('""');
	expect(atomoStringaVuota.tipo).toBe('STRINGA');
	expect(atomoStringaVuota.valore).toBe('');
	expect(atomoStringaVuota.toString()).toBe('""');

	const atomoSimbolo = Atomo.fromString('simbolo');
	expect(atomoSimbolo.tipo).toBe('SIMBOLO');
	expect(atomoSimbolo.valore).toBe('simbolo');
	expect(atomoSimbolo.toString()).toBe('simbolo');
});

test('Atomo: type guard', () => {
	expect(Atomo.èValoreAtomico(42)).toBe(true);
	expect(Atomo.èValoreAtomico(true)).toBe(true);
	expect(Atomo.èValoreAtomico('testo')).toBe(true);
	expect(Atomo.èValoreAtomico({})).toBe(false);
	expect(Atomo.èValoreAtomico([])).toBe(false);
});
