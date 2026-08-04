import {expect, test} from 'vitest'
import {Ambiente} from './ambiente'

test('Ambiente vuoto', () => {
	const ambiente = new Ambiente();
	expect (ambiente.isVuoto()).toBe(true);
});

test('Inserisci in uno stesso ambiente', () => {
	const ambiente = new Ambiente();
	ambiente.inserisci("x", 10);
	expect(ambiente.numElementi()).toBe(1);
	ambiente.inserisci("x", 5);
	expect(ambiente.numElementi()).toBe(1);
	ambiente.inserisci("square", "(lambda (x) (* x x))");
	expect(ambiente.numElementi()).toBe(2);
});


test('Applica in uno stesso ambiente', () => {
	const ambiente = new Ambiente();
	ambiente.inserisci("x", 10);
	expect(ambiente.applica("x")).toBe(10);
	ambiente.inserisci("x", 5);
	expect(ambiente.applica("x")).toBe(5);
	ambiente.inserisci("square", "(lambda (x) (* x x))");
	expect(ambiente.applica("square")).toBe("(lambda (x) (* x x))");
});


test('Applica in ambienti gerarchici', () => {
	const ambientePadre = new Ambiente();
	const ambienteFiglio = new Ambiente(ambientePadre);
	const ambienteNipote = new Ambiente(ambienteFiglio);

	ambientePadre.inserisci("x", "x padre");
	ambientePadre.inserisci("y", "y padre");
	ambientePadre.inserisci("z", "z padre");

	ambienteFiglio.inserisci("x", "x figlio");
	ambienteFiglio.inserisci("y", "y figlio");

	ambienteNipote.inserisci("x", "x nipote");

	expect(ambientePadre.applica("x")).toBe("x padre");
	expect(ambientePadre.applica("y")).toBe("y padre");
	expect(ambientePadre.applica("z")).toBe("z padre");

	expect(ambienteFiglio.applica("x")).toBe("x figlio");
	expect(ambienteFiglio.applica("y")).toBe("y figlio");
	expect(ambienteFiglio.applica("z")).toBe("z padre");

	expect(ambienteNipote.applica("x")).toBe("x nipote");
	expect(ambienteNipote.applica("y")).toBe("y figlio");
	expect(ambienteNipote.applica("z")).toBe("z padre");
});
