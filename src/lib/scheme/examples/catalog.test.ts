import { describe, expect, test } from 'vitest';
import { FormatterScheme } from '../ast/formatter';
import { creaAmbienteGlobale } from '../runtime/ambienteStandard';
import { StepperScheme } from '../runtime/stepper';
import { esempiScheme } from './catalog';

describe('Catalogo esempi Scheme', () => {
	test('espone identificatori univoci', () => {
		const identificatori = esempiScheme.map(esempio => esempio.id);

		expect(new Set(identificatori).size).toBe(identificatori.length);
	});

	for (const esempio of esempiScheme) {
		test(`esegue "${esempio.id}" secondo il contratto dichiarato`, () => {
			const esegui = () => {
				const stepper = new StepperScheme(creaAmbienteGlobale());
				const formatter = new FormatterScheme();
				const passi = stepper.passiDaSorgente(esempio.sorgente);
				return formatter.formattaTimelineStepping(passi);
			};

			if ('erroreAtteso' in esempio) {
				expect(esegui).toThrow(esempio.erroreAtteso);
				return;
			}

			const timeline = esegui();
			const ultimoPasso = timeline.at(-1);

			expect(ultimoPasso?.terminato).toBe(true);
			expect(ultimoPasso?.successivo).toBe(esempio.risultatoAtteso);
		});
	}
});
