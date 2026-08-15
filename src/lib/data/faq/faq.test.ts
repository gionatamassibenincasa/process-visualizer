// file: src/lib/data/faq/faq.test.ts
import { describe, expect, it } from 'vitest';
import { cercaNelFAQ, faqCatalog, sezioniFAQ, tutteLeDomande } from './index';

describe('Catalogo FAQ Scheme', () => {
	it('espone sezioni e catalogo con metadati validi', () => {
		expect(faqCatalog.title).toBeDefined();
		expect(sezioniFAQ.length).toBeGreaterThanOrEqual(7);
		expect(tutteLeDomande.length).toBeGreaterThan(30);
	});

	it('ogni sezione ha un identificatore univoco e items non vuoti', () => {
		const ids = new Set<string>();
		for (const sezione of sezioniFAQ) {
			expect(ids.has(sezione.id)).toBe(false);
			ids.add(sezione.id);
			expect(sezione.titolo.length).toBeGreaterThan(0);
			expect(sezione.items.length).toBeGreaterThan(0);
		}
	});

	it('ogni domanda ha domanda, risposta ed esempi validi', () => {
		for (const item of tutteLeDomande) {
			expect(item.id).toBeDefined();
			expect(item.domanda.length).toBeGreaterThan(0);
			expect(item.risposta.length).toBeGreaterThan(0);

			if (item.esempio) {
				const esempi = Array.isArray(item.esempio) ? item.esempio : [item.esempio];
				for (const es of esempi) {
					expect(es.titolo).toBeDefined();
					expect(['codice', 'testo']).toContain(es.tipo);
					expect(es.contenuto.length).toBeGreaterThan(0);
				}
			}
		}
	});

	it('la funzione di ricerca cercaNelFAQ filtra correttamente per parole chiave e sezioni', () => {
		const risultatiAmbiente = cercaNelFAQ('ambiente');
		expect(risultatiAmbiente.length).toBeGreaterThan(0);

		const risultatiLambda = cercaNelFAQ('lambda', 'funzioni-e-lambda');
		expect(risultatiLambda.length).toBeGreaterThan(0);

		const risultatiVuoti = cercaNelFAQ('stringainusualechedovrebberecuperarezerorisultati');
		expect(risultatiVuoti.length).toBe(0);
	});
});
