import { expect, test } from 'vitest';
import { creaAmbienteGlobale } from './ambienteStandard';
import type { FunzionePrimitiva, ValoreScheme } from './valori';

function applicaPrimitiva(nome: string, ...argomenti: ValoreScheme[]): ValoreScheme {
    const valore = creaAmbienteGlobale().applica(nome);
    if (typeof valore !== 'function') {
        throw new Error(`'${nome}' non e una primitiva.`);
    }

    return (valore as FunzionePrimitiva)(...argomenti);
}

test('espone la lista vuota e tutte le primitive italiane', () => {
    const ambiente = creaAmbienteGlobale();

    expect(ambiente.applica('lista-vuota')).toEqual([]);
    expect(typeof ambiente.applica('atomo?')).toBe('function');
    expect(typeof ambiente.applica('lista?')).toBe('function');
    expect(typeof ambiente.applica('lista-vuota?')).toBe('function');
    expect(typeof ambiente.applica('uguale?')).toBe('function');
    expect(typeof ambiente.applica('primo')).toBe('function');
    expect(typeof ambiente.applica('resto')).toBe('function');
    expect(typeof ambiente.applica('anteponi')).toBe('function');
    expect(typeof ambiente.applica('lista')).toBe('function');
});

test('mantiene gli alias Scheme alle stesse primitive italiane', () => {
    const ambiente = creaAmbienteGlobale();

    expect(ambiente.applica('lista?')).toBe(ambiente.applica('list?'));
    expect(ambiente.applica('lista-vuota?')).toBe(ambiente.applica('null?'));
    expect(ambiente.applica('uguale?')).toBe(ambiente.applica('eq?'));
    expect(ambiente.applica('primo')).toBe(ambiente.applica('car'));
    expect(ambiente.applica('resto')).toBe(ambiente.applica('cdr'));
    expect(ambiente.applica('anteponi')).toBe(ambiente.applica('cons'));
    expect(ambiente.applica('lista')).toBe(ambiente.applica('list'));
});

test('costruisce e naviga liste senza modificare la lista di origine', () => {
    const lista = applicaPrimitiva('lista', 1, 2, 3);
    const listaConTesta = applicaPrimitiva('anteponi', 0, lista);

    expect(lista).toEqual([1, 2, 3]);
    expect(listaConTesta).toEqual([0, 1, 2, 3]);
    expect(applicaPrimitiva('primo', listaConTesta)).toBe(0);
    expect(applicaPrimitiva('resto', listaConTesta)).toEqual([1, 2, 3]);
});

test('riconosce atomi, liste e lista vuota', () => {
    const listaVuota = creaAmbienteGlobale().applica('lista-vuota');
    const lista = applicaPrimitiva('lista', 1);

    expect(applicaPrimitiva('atomo?', 1)).toBe(true);
    expect(applicaPrimitiva('atomo?', lista)).toBe(false);
    expect(applicaPrimitiva('atomo?', listaVuota)).toBe(false);
    expect(applicaPrimitiva('lista?', lista)).toBe(true);
    expect(applicaPrimitiva('list?', 1)).toBe(false);
    expect(applicaPrimitiva('lista-vuota?', listaVuota)).toBe(true);
    expect(applicaPrimitiva('null?', lista)).toBe(false);
});

test('confronta valori e gestisce gli errori delle primitive di lista', () => {
    expect(applicaPrimitiva('uguale?', 'a', 'a')).toBe(true);
    expect(applicaPrimitiva('eq?', 'a', 'b')).toBe(false);
    expect(() => applicaPrimitiva('primo', [])).toThrow("'primo' non e definito per la lista vuota.");
    expect(() => applicaPrimitiva('resto', 1)).toThrow("'resto' richiede una lista.");
    expect(() => applicaPrimitiva('anteponi', 1, 2)).toThrow("'anteponi' richiede una lista.");
});
