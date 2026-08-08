// file: src/lib/scheme/examples/catalog.ts
/**
 * Catalogo degli esempi Scheme predefiniti per la UI ed i test di integrazione.
 *
 * Raccoglie i sorgenti `.scm` di esempio (es. algoritmi "Giochi Di Numeri"),
 * con i relativi metadati e risultati/errori attesi per il test dinamico.
 *
 * @module examples/catalog
 * @example
 * ```typescript
 * import { esempiScheme } from './catalog';
 *
 * console.log(esempiScheme[0].id); // 'gdn-addizione'
 * ```
 */

interface EsempioBase {
	/** Identificatore univoco dell'esempio. */
	id: string;
	/** Titolo descrittivo da visualizzare. */
	titolo: string;
	/** Spiegazione sintetica del contenuto dell'esempio. */
	descrizione: string;
	/** Codice sorgente Scheme dell'esempio. */
	sorgente: string;
}

interface EsempioConRisultatoAtteso extends EsempioBase {
	/** Risultato atteso al termine della valutazione dello stepper. */
	risultatoAtteso: string;
	erroreAtteso?: never;
}

interface EsempioConErroreAtteso extends EsempioBase {
	risultatoAtteso?: never;
	/** Messaggio d'errore di runtime o sintattico atteso. */
	erroreAtteso: string;
}

/**
 * Tipo unione per gli esempi del catalogo Scheme.
 */
export type EsempioScheme = EsempioConRisultatoAtteso | EsempioConErroreAtteso;

import gdnAddizioneSorgente from './gdn-addizione.scm?raw';
import gdnPiuSorgente from './gdn-piu.scm?raw';
import gdnMinoreSorgente from './gdn-minore.scm?raw';
import gdnSottrazioneSorgente from './gdn-sottrazione.scm?raw';
import gdnQuozienteSorgente from './gdn-quoziente.scm?raw';

/**
 * Sorgenti raw dei file di esempio `.scm`.
 */
export const fileSorgente = {
	gdnAddizione: gdnAddizioneSorgente,
	gdnPiu: gdnPiuSorgente,
	gdnMinore: gdnMinoreSorgente,
	gdnSottrazione: gdnSottrazioneSorgente,
	gdnQuoziente: gdnQuozienteSorgente
};

/**
 * Elenco ordinato degli esempi Scheme pronti per la dimostrazione e il collaudo.
 */
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
	},
	{
		id: 'gdn-minore',
		titolo: 'Giochi Di Numeri: minore (<)',
		descrizione: "Definizione e applicazioni per l'operatore di confronto minore.",
		sorgente: fileSorgente.gdnMinore,
		risultatoAtteso: '#<chiusura:<>\n#t\n#f'
	},
	{
		id: 'gdn-sottrazione',
		titolo: 'Giochi Di Numeri: sottrazione',
		descrizione: "Definizione e applicazioni per l'operatore di sottrazione.",
		sorgente: fileSorgente.gdnSottrazione,
		risultatoAtteso: '#<chiusura:->\n3'
	},
	{
		id: 'gdn-quoziente',
		titolo: 'Giochi Di Numeri: quoziente',
		descrizione: "Definizione e applicazioni per l'operatore di quoziente.",
		sorgente: fileSorgente.gdnQuoziente,
		risultatoAtteso: '#<chiusura:quoziente>\n3'
	}
];
