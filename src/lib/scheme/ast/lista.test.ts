import { describe, expect, it } from 'vitest';
import { Atomo } from './atomo';
import { Coppia } from './coppia';
import { Lista, lista, listaVuota } from './lista';

describe('Lista', () => {
	it('usa una factory per la lista vuota', () => {
		const vuota = listaVuota();

		expect(Lista.èLista(vuota)).toBe(true);
		expect(vuota.vuoto()).toBe(true);
		expect(vuota.primo).toBeNull();
		expect(vuota.resto).toBeNull();
		expect(vuota.toString()).toBe('()');
	});

	it("rappresenta ricorsivamente la coda come un'altra Lista", () => {
		const primo = Atomo.fromString('a');
		const secondo = Atomo.fromString('b');
		const valori = new Lista([primo, secondo]);

		expect(valori.vuoto()).toBe(false);
		expect(valori.primo).toBe(primo);
		expect(valori.resto).toBeInstanceOf(Lista);
		expect(valori.resto?.primo).toBe(secondo);
		expect(valori.resto?.resto?.vuoto()).toBe(true);
		expect(valori.toString()).toBe('(a b)');
	});

	it('accetta come elementi null, Atomo, Coppia e Lista', () => {
		const atomo = Atomo.fromString('"ciao"');
		const coppia = new Coppia(Atomo.fromString('x'), Atomo.fromString('y'));
		const sottoLista = new Lista([Atomo.fromString('z')]);
		const valori = lista(null, atomo, coppia, sottoLista);

		expect(valori.preleva(0)).toBeNull();
		expect(valori.preleva(1)).toBe(atomo);
		expect(valori.preleva(2)).toBe(coppia);
		expect(valori.preleva(3)).toBe(sottoLista);
		expect(valori.toString()).toBe('(() "ciao" (x . y) (z))');
	});

	it('parsa liste annidate convertendo i token primitivi in Atomo', () => {
		const listaParsata = Lista.fromString('(alpha ("beta" #t) ())');

		expect(listaParsata.primo).toEqual(Atomo.fromString('alpha'));
		expect(listaParsata.resto?.primo).toBeInstanceOf(Lista);
		expect((listaParsata.resto?.primo as Lista).toString()).toBe('("beta" #t)');
		expect(listaParsata.resto?.resto?.primo).toBeInstanceOf(Lista);
		expect((listaParsata.resto?.resto?.primo as Lista).vuoto()).toBe(true);
		expect(listaParsata.toString()).toBe('(alpha ("beta" #t) ())');
	});

	it('solleva un errore quando si prova a prelevare oltre la fine', () => {
		const valori = new Lista([Atomo.fromString('a')]);

		expect(() => valori.preleva(1)).toThrow('Indice fuori dai limiti della lista.');
	});
});
