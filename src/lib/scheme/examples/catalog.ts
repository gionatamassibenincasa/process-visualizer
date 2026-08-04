import atomoSorgente from './01-atomo.scm?raw';
import sottrazioneSenzaArgomentiSorgente from './02-errore-sottrazione-senza-argomenti.scm?raw';

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

export const esempiScheme: readonly EsempioScheme[] = [
	{
		id: 'atomo-uno',
		titolo: 'Un atomo numerico',
		descrizione: 'Un numero e un atomo auto-valutante: il programma 1 restituisce 1.',
		sorgente: atomoSorgente,
		risultatoAtteso: '1'
	},
	{
		id: 'errore-sottrazione-senza-argomenti',
		titolo: 'Errore: sottrazione senza argomenti',
		descrizione: "L'operatore - richiede almeno un argomento numerico.",
		sorgente: sottrazioneSenzaArgomentiSorgente,
		erroreAtteso: "'-' richiede almeno un argomento."
	}
];
