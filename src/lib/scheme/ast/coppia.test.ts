import { expect, test } from 'vitest';
import { Atomo } from './atomo';
import { Coppia } from './coppia';

test('Coppia - primo e resto', () => {
    for (const car of [Atomo.fromString('""'), Atomo.fromString("1"), Atomo.fromString('a'), new Coppia(Atomo.fromString("3"), null), new Coppia(Atomo.fromString("3"), Atomo.fromString("4"))]) {
        for (const cdr of [null, Atomo.fromString('""'), Atomo.fromString("1"), Atomo.fromString('a'), new Coppia(Atomo.fromString("3"), null), new Coppia(Atomo.fromString("3"), Atomo.fromString("4"))]) {
            const result = new Coppia(car, cdr);
            expect(result.primo).toEqual(car);
            expect(result.resto).toEqual(cdr);
        }
    }
});

test('Coppia - toString - stringhe vs simboli', () => {
    const atomoA = Atomo.fromString('"a"');
    expect(atomoA.tipo).toBe('STRINGA');
    expect(atomoA.valore).toBe('a');
    const atomoB = Atomo.fromString('"b"');
    const coppia = new Coppia(atomoA, atomoB);
    expect(coppia.toString()).toBe('("a" . "b")');
});

test('Coppia - toString', () => {
    const testCases: [Coppia, string][] = [
        [new Coppia(Atomo.fromString("1"), Atomo.fromString("2")), "(1 . 2)"],
        [new Coppia(Atomo.fromString("a"), Atomo.fromString("b")), "(a . b)"],
        [new Coppia(Atomo.fromString('"a"'), Atomo.fromString('"b"')), '("a" . "b")'],
        [new Coppia(new Coppia(Atomo.fromString("1"), Atomo.fromString("2")), Atomo.fromString("3")), "((1 . 2) . 3)"],
        [new Coppia(Atomo.fromString("1"), new Coppia(Atomo.fromString("2"), Atomo.fromString("3"))), "(1 . (2 . 3))"],
        [new Coppia(null, null), "(() . ())"],
        [new Coppia(Atomo.fromString('""'), null), '("" . ())'],
    ];

    for (const [coppia, expected] of testCases) {
        expect(coppia.toString()).toBe(expected);
    }
});