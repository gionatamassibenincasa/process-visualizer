import { describe, expect, it } from 'vitest';
import { Atomo } from './atomo';
import { Coppia } from './coppia';
import { Lista } from './lista';
import {
	ApplicazioneAST,
	AtomoAST,
	CitazioneAST,
	DefineAST,
	LambdaAST,
	ListaAST,
	ProgrammaAST
} from './ast';

describe('Nuovi nodi AST', () => {
	it('rappresenta un programma come sequenza ordinata di forme', () => {
		const programma = new ProgrammaAST([
			new DefineAST(new AtomoAST('x'), new AtomoAST(10)),
			new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST('x'), new AtomoAST(5)])
		]);

		expect(programma.forme).toHaveLength(2);
		expect(programma.forme[0]).toBeInstanceOf(DefineAST);
		expect(programma.forme[1]).toBeInstanceOf(ApplicazioneAST);
	});

	it('rappresenta una lambda con parametri e corpo', () => {
		const lambda = new LambdaAST(
			[new AtomoAST('n')],
			[new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST('n'), new AtomoAST(1)])]
		);

		expect(lambda.parametri).toHaveLength(1);
		expect(lambda.parametri[0].valore).toBe('n');
		expect(lambda.corpo).toHaveLength(1);
		expect(lambda.corpo[0]).toBeInstanceOf(ApplicazioneAST);
	});

	it("rappresenta un'applicazione con operatore e argomenti", () => {
		const applicazione = new ApplicazioneAST(new AtomoAST('+'), [new AtomoAST(1), new AtomoAST(2)]);

		expect(applicazione.operatore).toBeInstanceOf(AtomoAST);
		expect(applicazione.argomenti).toHaveLength(2);
		expect(applicazione.argomenti[0]).toBeInstanceOf(AtomoAST);
		expect(applicazione.argomenti[1]).toBeInstanceOf(AtomoAST);
	});

	it('usa le astrazioni Atomo, Coppia e Lista nei dati citati', () => {
		const listaCitata = new Lista([
			Atomo.fromString('a'),
			new Coppia(Atomo.fromString('b'), Atomo.fromString('c')),
			new Lista([Atomo.fromString('d')])
		]);
		const citazione = new CitazioneAST(listaCitata);

		expect(citazione.espressione).toBe(listaCitata);
		expect(listaCitata.toString()).toBe('(a (b . c) (d))');
	});

	it('accetta nodi annidati in una lista AST di supporto', () => {
		const listaAst = new ListaAST([
			new AtomoAST('quote'),
			new ListaAST([new AtomoAST('x'), new AtomoAST('y')])
		]);

		expect(listaAst.elementi).toHaveLength(2);
		expect(listaAst.elementi[1]).toBeInstanceOf(ListaAST);
	});
});
