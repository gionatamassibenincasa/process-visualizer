// file: src/lib/data/faq/index.ts
/**
 * Modulo centrale di esportazione per la documentazione FAQ di Scheme.
 *
 * @module data/faq
 */

import sec01 from './01-ambienti-e-struttura.json';
import sec02 from './02-sintassi-base-e-atomi.json';
import sec03 from './03-dati-liste-e-citazioni.json';
import sec04 from './04-forme-di-controllo.json';
import sec05 from './05-funzioni-e-lambda.json';
import sec06 from './06-ricorsione-e-algoritmi.json';
import sec07 from './07-grammatica-ebnf-e-interprete.json';
import type { DomandaRisposta, FAQCatalog, SezioneFAQ } from './types';

export * from './types';

export const sezioniFAQ: SezioneFAQ[] = [
	sec01 as SezioneFAQ,
	sec02 as SezioneFAQ,
	sec03 as SezioneFAQ,
	sec04 as SezioneFAQ,
	sec05 as SezioneFAQ,
	sec06 as SezioneFAQ,
	sec07 as SezioneFAQ
];

export const faqCatalog: FAQCatalog = {
	version: '1.0.0',
	title: 'Guida e Documentazione Scheme',
	subtitle: 'Domande frequenti, semantica operativa, sintassi EBNF ed esempi interattivi',
	sezioni: sezioniFAQ
};

/**
 * Restituisce la lista piatta di tutte le domande/risposte presenti nel catalogo.
 */
export const tutteLeDomande: DomandaRisposta[] = sezioniFAQ.flatMap((sezione) => sezione.items);

/**
 * Cerca nelle domande, risposte, EBNF e tag con una stringa di ricerca.
 */
export function cercaNelFAQ(query: string, sezioneId?: string): DomandaRisposta[] {
	const q = query.trim().toLowerCase();
	const pool =
		sezioneId && sezioneId !== 'all'
			? (sezioniFAQ.find((s) => s.id === sezioneId)?.items ?? [])
			: tutteLeDomande;

	if (!q) {
		return pool;
	}

	return pool.filter((item) => {
		const matchDomanda = item.domanda.toLowerCase().includes(q);
		const matchRisposta = item.risposta.toLowerCase().includes(q);
		const matchEbnf = item.ebnf ? item.ebnf.toLowerCase().includes(q) : false;
		const matchTags = item.tag ? item.tag.some((t) => t.toLowerCase().includes(q)) : false;
		const matchEsempio = Array.isArray(item.esempio)
			? item.esempio.some(
					(e) => e.titolo.toLowerCase().includes(q) || e.contenuto.toLowerCase().includes(q)
				)
			: item.esempio
				? item.esempio.titolo.toLowerCase().includes(q) ||
					item.esempio.contenuto.toLowerCase().includes(q)
				: false;

		return matchDomanda || matchRisposta || matchEbnf || matchTags || matchEsempio;
	});
}
