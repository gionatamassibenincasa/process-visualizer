import { describe, expect, test } from 'vitest';
import { Coppia } from './coppia';
import { Lista } from './lista';
import {
    ApplicazioneAST,
    AndAST,
    AtomoAST,
    CitazioneAST,
    CondAST,
    DefineAST,
    IfAST,
    LambdaAST,
    OrAST,
    ProgrammaAST,
} from './ast';
import { parseProgrammaDaSorgente } from './parser';

describe('ParserScheme', () => {
    test('parsa un programma con define e applicazione', () => {
        const programma = parseProgrammaDaSorgente('(define x 10) (+ x 5)');

        expect(programma).toBeInstanceOf(ProgrammaAST);
        expect(programma.forme).toHaveLength(2);
        expect(programma.forme[0]).toBeInstanceOf(DefineAST);
        expect(programma.forme[1]).toBeInstanceOf(ApplicazioneAST);
    });

    test('parsa lambda con corpo non vuoto', () => {
        const programma = parseProgrammaDaSorgente('(lambda (n) (+ n 1))');
        const lambda = programma.forme[0];

        expect(lambda).toBeInstanceOf(LambdaAST);
        expect((lambda as LambdaAST).parametri).toHaveLength(1);
        expect((lambda as LambdaAST).corpo).toHaveLength(1);
    });

    test('parsa if con else opzionale', () => {
        const programma = parseProgrammaDaSorgente('(if #t 1)');
        const nodoIf = programma.forme[0] as IfAST;

        expect(nodoIf).toBeInstanceOf(IfAST);
        expect(nodoIf.condizione).toBeInstanceOf(AtomoAST);
        expect(nodoIf.ramoThen).toBeInstanceOf(AtomoAST);
        expect(nodoIf.ramoElse).toBeInstanceOf(AtomoAST);
        expect((nodoIf.ramoElse as AtomoAST).valore).toBe(false);
    });

    test('parsa and, or e cond', () => {
        const programma = parseProgrammaDaSorgente('(and #t #f) (or #f #t) (cond (#f 1) (#t 2))');

        expect(programma.forme[0]).toBeInstanceOf(AndAST);
        expect(programma.forme[1]).toBeInstanceOf(OrAST);
        expect(programma.forme[2]).toBeInstanceOf(CondAST);
        expect((programma.forme[2] as CondAST).clausole).toHaveLength(2);
    });

    test('normalizza else e altrimenti a #t nelle clausole cond', () => {
        const programma = parseProgrammaDaSorgente('(cond (else 1) (altrimenti 2))');
        const cond = programma.forme[0] as CondAST;

        expect(cond).toBeInstanceOf(CondAST);
        expect((cond.clausole[0].condizione as AtomoAST).valore).toBe(true);
        expect((cond.clausole[1].condizione as AtomoAST).valore).toBe(true);
    });

    test('parsa citazione abbreviata con lista datum runtime', () => {
        const programma = parseProgrammaDaSorgente("'(a b)");
        const citazione = programma.forme[0] as CitazioneAST;

        expect(citazione).toBeInstanceOf(CitazioneAST);
        expect(citazione.espressione).toBeInstanceOf(Lista);
        expect((citazione.espressione as Lista).toString()).toBe('(a b)');
    });

    test('parsa coppia puntata in datum citato', () => {
        const programma = parseProgrammaDaSorgente("'(a . b)");
        const citazione = programma.forme[0] as CitazioneAST;

        expect(citazione.espressione).toBeInstanceOf(Coppia);
        expect((citazione.espressione as Coppia).toString()).toBe('(a . b)');
    });

    test('genera errore sintattico su parentesi mancanti', () => {
        expect(() => parseProgrammaDaSorgente('(define x 10')).toThrow(SyntaxError);
    });
});