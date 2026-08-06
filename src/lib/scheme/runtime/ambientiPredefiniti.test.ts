import { expect, test } from 'vitest';
import { registroAmbienti, profiloAmbientePredefinito } from './registroAmbienti';

test('registra profili ambiente univoci e crea istanze indipendenti', () => {
	const identificatori = registroAmbienti.map((profilo) => profilo.id);
	const ambienteStandard = registroAmbienti.find((profilo) => profilo.id === 'standard');

	expect(new Set(identificatori).size).toBe(identificatori.length);
	expect(profiloAmbientePredefinito.id).toBe('standard');
	expect(ambienteStandard).toBeDefined();
	expect(ambienteStandard?.crea()).not.toBe(ambienteStandard?.crea());
});
