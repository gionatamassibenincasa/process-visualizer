import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { eseguiStepperDaFile } from './stepper-cli';

describe('stepper-cli', () => {
	test('stampa la timeline completa per un file sorgente', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'scheme-cli-'));
		const file = path.join(dir, 'programma.scm');

		try {
			writeFileSync(file, '(define x 10) (+ x 5)\n', 'utf-8');

			const output = eseguiStepperDaFile({
				filePath: file,
				maxPassi: 30,
				format: 'text',
				interactive: false,
				ambiente: undefined
			});

			expect(output).toContain('==>');
			expect(output).toContain('Programma: forma');
			expect(output).toContain('TERMINATO');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	test('genera output JSON strutturato', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'scheme-cli-json-'));
		const file = path.join(dir, 'programma-json.scm');

		try {
			writeFileSync(file, '(define x 10) (+ x 5)\n', 'utf-8');

			const output = eseguiStepperDaFile({
				filePath: file,
				maxPassi: 30,
				format: 'json',
				interactive: false,
				ambiente: undefined
			});

			const parsed = JSON.parse(output) as {
				filePath: string;
				maxPassi: number;
				numeroPassi: number;
				terminato: boolean;
				passi: Array<{ regola: string; terminato: boolean }>;
			};

			expect(parsed.filePath).toBe(file);
			expect(parsed.maxPassi).toBe(30);
			expect(parsed.numeroPassi).toBeGreaterThan(0);
			expect(parsed.terminato).toBe(true);
			expect(parsed.passi.length).toBe(parsed.numeroPassi);
			expect(parsed.passi[0].regola.length).toBeGreaterThan(0);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	test('genera output Markdown per Slidev (sli.dev)', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'scheme-cli-slidev-'));
		const file = path.join(dir, 'slidev.scm');

		try {
			writeFileSync(file, '(define x 42) x\n', 'utf-8');

			const output = eseguiStepperDaFile({
				filePath: file,
				maxPassi: 20,
				format: 'slidev',
				interactive: false,
				ambiente: undefined
			});

			expect(output).toContain('theme: default');
			expect(output).toContain('title: "Esecuzione Scheme: slidev.scm"');
			expect(output).toContain('---');
			expect(output).toContain('### Stato AST');
			expect(output).toContain('```scheme');
			expect(output).toContain('> **Regola applicata:**');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});
