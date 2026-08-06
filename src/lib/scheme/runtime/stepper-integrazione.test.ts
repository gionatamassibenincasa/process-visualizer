import { describe, expect, test } from 'vitest';
import { FormatterScheme } from '../ast/formatter';
import { creaAmbiente } from './ambienteStandard';
import { StepperScheme } from './stepper';

describe('Integrazione parser-stepper', () => {
    test('valuta programma con define seguito da applicazione', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(define x 10) (+ x 5)', 20);

        expect(passi.length).toBeGreaterThan(0);
        expect(passi[passi.length - 1].èTerminato).toBe(true);

        const ultimoAst = passi[passi.length - 1].astSuccessivo;
        const output = formatter.stampa(ultimoAst);
        expect(output).toContain('15');
    });

    test('riduce un if parsato da sorgente', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(if #t 1 2)', 20);
        const outputFinale = formatter.stampa(passi[passi.length - 1].astSuccessivo);

        expect(passi[passi.length - 1].èTerminato).toBe(true);
        expect(outputFinale).toContain('1');
    });

    test('riduce and e or parsati da sorgente', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passiAnd = stepper.passiDaSorgente('(and #t #f)', 20);
        const andFinale = formatter.stampa(passiAnd[passiAnd.length - 1].astSuccessivo);
        expect(andFinale).toContain('#f');

        const passiOr = stepper.passiDaSorgente('(or #f #t)', 20);
        const orFinale = formatter.stampa(passiOr[passiOr.length - 1].astSuccessivo);
        expect(orFinale).toContain('#t');
    });

    test('applica primo a una lista quotata', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(primo (quote (1 2 3)))', 20);
        const outputFinale = formatter.stampa(passi[passi.length - 1].astSuccessivo);

        expect(passi[passi.length - 1].èTerminato).toBe(true);
        expect(outputFinale).toBe('1');
    });

    test('mostra la riscrittura lambda nella traccia ricorsiva', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();
        const sorgente = `
            (define addizione
              (lambda (n m)
                (cond
                  ((zero? m) n)
                  (else (s (addizione n (p m)))))))
            (addizione 3 2)
        `;

        const timeline = formatter.formattaTimelineStepping(stepper.passiDaSorgente(sorgente, 100));
        const outputFinale = timeline[timeline.length - 1].successivo;

        expect(timeline.some(passo => passo.regola.includes('Riscrittura lambda: n ← 3, m ← 2'))).toBe(true);
        expect(timeline.some(passo => passo.successivo.includes('(s (addizione 3 (p 2)))'))).toBe(true);
        expect(outputFinale).toContain('5');
    });

    test('esegue ricorsione con fattoriale', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const sorgente = `
            (define fattoriale
              (lambda (n)
                (if (= n 0)
                    1
                    (* n (fattoriale (- n 1))))))
            (fattoriale 5)
        `;

        const passi = stepper.passiDaSorgente(sorgente, 400);
        const outputFinale = formatter.stampa(passi[passi.length - 1].astSuccessivo);

        expect(passi[passi.length - 1].èTerminato).toBe(true);
        expect(outputFinale).toContain('120');
    });
});
