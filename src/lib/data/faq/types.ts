// file: src/lib/data/faq/types.ts
/**
 * Tipi per la documentazione strutturata a domande e risposte (FAQ).
 *
 * @module data/faq/types
 */

export type TipoEsempio = 'testo' | 'codice';

export interface EsempioFAQ {
	titolo: string;
	tipo: TipoEsempio;
	contenuto: string;
}

export interface DomandaRisposta {
	id: string;
	domanda: string;
	risposta: string;
	ebnf?: string;
	esempio?: EsempioFAQ | EsempioFAQ[];
	tag?: string[];
}

export interface SezioneFAQ {
	id: string;
	titolo: string;
	icona?: string;
	descrizione: string;
	items: DomandaRisposta[];
}

export interface FAQCatalog {
	version: string;
	title: string;
	subtitle: string;
	sezioni: SezioneFAQ[];
}
