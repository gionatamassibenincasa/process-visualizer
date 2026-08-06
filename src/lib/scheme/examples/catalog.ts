// file: src/lib/scheme/examples/catalog.ts

// --- Tipi per i Test e per il Catalogo ---

interface EsempioBase {
	id: string;
	titolo: string;
	descrizione: string;
	sorgente: string;
}

interface EsempioConRisultatoAtteso extends EsempioBase {
	risultatoAtteso: string;
	erroreAtteso?: never;
}

interface EsempioConErroreAtteso extends EsempioBase {
	risultatoAtteso?: never;
	erroreAtteso: string;
}

export type EsempioScheme = EsempioConRisultatoAtteso | EsempioConErroreAtteso;

import gdnAddizioneSorgente from './gdn-addizione.scm?raw';
import gdnPiuSorgente from './gdn-piu.scm?raw';

export const fileSorgente = {
	gdnAddizione: gdnAddizioneSorgente,
	gdnPiu: gdnPiuSorgente
};

// --- Catalogo Esempi ---

export const esempiScheme: readonly EsempioScheme[] = [
	{
		id: 'gdn-addizione',
		titolo: 'Giochi Di Numeri: addizione',
		descrizione: "Definizione e applicazioni per l'operatore di addizione.",
		sorgente: fileSorgente.gdnAddizione,
		risultatoAtteso: '#<chiusura:addizione>\n3\n5'
	},
	{
		id: 'gdn-piu',
		titolo: 'Giochi Di Numeri: addizione (operatore +)',
		descrizione: "Definizione e applicazioni per l'operatore + di addizione.",
		sorgente: fileSorgente.gdnPiu,
		risultatoAtteso: '#<chiusura:+>\n3\n5'
	}
];
