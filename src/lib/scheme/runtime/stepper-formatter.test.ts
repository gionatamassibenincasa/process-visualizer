import { describe, expect, test } from 'vitest';
import { FormatterScheme } from '../ast/formatter';
import { creaAmbienteGlobale } from './ambienteStandard';
import { StepperScheme } from './stepper';

describe('Formatter + Stepper', () => {
    test('genera snapshot timeline coerenti per la UI', () => {
        const env = creaAmbienteGlobale();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(define x 10) (+ x 5)', 30);
        const timeline = formatter.formattaTimelineStepping(passi);

        expect(timeline.length).toBeGreaterThan(0);
        expect(timeline[0].indice).toBe(0);
        expect(timeline[0].regola.length).toBeGreaterThan(0);
        expect(timeline[0].precedente.length).toBeGreaterThan(0);
        expect(timeline[0].successivo.length).toBeGreaterThan(0);
        expect(timeline[timeline.length - 1].terminato).toBe(true);
    });

    test('estrae focus forma top-level da regola programma', () => {
        const env = creaAmbienteGlobale();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(define x 1) (+ x 2)', 20);
        const timeline = formatter.formattaTimelineStepping(passi);

        const primoConFocus = timeline.find(item => item.focusProgramma !== null);
        expect(primoConFocus).toBeDefined();
        expect(primoConFocus?.focusProgramma?.indiceForma).toBe(1);
        expect(primoConFocus?.focusProgramma?.totaleForme).toBe(2);
    });

    test('espone anche una traccia testuale lineare', () => {
        const env = creaAmbienteGlobale();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(if #t 1 2)', 10);
        const traccia = formatter.formattaTimelineTestuale(passi);

        expect(traccia).toContain('==>');
        expect(traccia).toContain('TERMINATO');
    });
});
