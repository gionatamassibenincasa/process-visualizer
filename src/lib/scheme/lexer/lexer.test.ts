import { expect, test } from 'vitest';
import { analizzatoreLessicale } from './lexer';

test('commento', () => {
	const src_prg = '; Commento\n';
	const seq_parole = analizzatoreLessicale(src_prg);
	const attesa = { tipo: 'EOF', valore: null };
	// console.log(seq_parole[0]);
	expect(seq_parole[0]).toEqual(attesa);
});

test('parentesi aperta', () => {
	const src_prg = ' ( ';
	const seq_parole = analizzatoreLessicale(src_prg);
	const attesa = { tipo: 'LPAREN', valore: '(' };
	// console.log(seq_parole[0]);
	expect(seq_parole[0]).toEqual(attesa);
});

test('commento e parentesi aperta', () => {
	const src_prg = '; Commento\n()';
	const seq_parole = analizzatoreLessicale(src_prg);
	const attesa = { tipo: 'LPAREN', valore: '(' };
	// console.log(seq_parole[0]);
	expect(seq_parole[0]).toEqual(attesa);
});

test('commento e parentesi chiusa', () => {
	const src_prg = '; Commento\n)';
	const seq_parole = analizzatoreLessicale(src_prg);
	const attesa = { tipo: 'RPAREN', valore: ')' };
	// console.log(seq_parole[0]);
	expect(seq_parole[0]).toEqual(attesa);
});
