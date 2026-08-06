import { describe, expect, test } from 'vitest';
import { FormatterScheme } from '../ast/formatter';
import { creaAmbiente } from './ambienteStandard';
import { StepperScheme } from './stepper';

describe('Formatter + Stepper', () => {
    test('genera snapshot timeline coerenti per la UI', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(define x 10) (+ x 5)', 30);
        const timeline = formatter.formattaTimelineStepping(passi);

        expect(timeline.length).toBeGreaterThan(0);
        expect(timeline[0].indice).toBe(0);
        expect(timeline[0].regola.length).toBeGreaterThan(0);
        expect(timeline[0].precedente.length).toBeGreaterThan(0);
        expect(timeline[0].successivo.length).toBeGreaterThan(0);
        expect(timeline[0].ambiente.scope).not.toHaveLength(0);
        expect(timeline[timeline.length - 1].terminato).toBe(true);
    });

    test('conserva l ambiente di ogni passo come istantanea indipendente', () => {
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const timeline = formatter.formattaTimelineStepping(
            stepper.passiDaSorgente('(define x 1) (define x 2)', 20)
        );
        const definizioneIniziale = timeline.find(step => step.regola.includes("'x' = 1"));

        expect(definizioneIniziale?.ambiente.scope.at(-1)?.binding.x).toBe('1');
        expect(env.applica('x')).toBe(2);
    });

    test('estrae focus forma top-level da regola programma', () => {
        const env = creaAmbiente();
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
        const env = creaAmbiente();
        const stepper = new StepperScheme(env);
        const formatter = new FormatterScheme();

        const passi = stepper.passiDaSorgente('(if #t 1 2)', 10);
        const traccia = formatter.formattaTimelineTestuale(passi);

        expect(traccia).toContain('==>');
        expect(traccia).toContain('TERMINATO');
    });
});
