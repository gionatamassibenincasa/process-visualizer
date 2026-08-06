import atomoNumericoSorgente from './01-atomo-numerico.scm?raw';
import atomoStringaSorgente from './01-atomo-stringa.scm?raw';
import atomoBooleanoSorgente from './01-atomo-booleano.scm?raw';
import atomoSimboloSorgente from './01-atomo-simbolo.scm?raw';
import applicazioniAddizioneBinariaSorgente from './02-applicazioni-aritmetiche-addizione.scm?raw';
import applicazioniAddizioneNariaSorgente from './02-applicazioni-aritmetiche-addizione-molti-operandi.scm?raw';
import applicazioniAritmeticheRicorsiveSorgente from './02-applicazioni-aritmetiche-ricorsive.scm?raw';
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
		id: 'atomo-numerico',
		titolo: 'Un atomo numerico',
		descrizione: 'Un numero e un atomo auto-valutante: il programma restituisce 1.',
		sorgente: atomoNumericoSorgente,
		risultatoAtteso: '1'
	},
	{
		id: 'atomo-stringa',
		titolo: 'Un atomo stringa',
		descrizione: 'Una stringa e un atomo auto-valutante: il programma restituisce "stringa".',
		sorgente: atomoStringaSorgente,
		risultatoAtteso: 'stringa'
	},
	{
		id: 'atomo-booleano',
		titolo: 'Un atomo booleano',
		descrizione: 'Un booleano e un atomo auto-valutante: il programma restituisce #t.',
		sorgente: atomoBooleanoSorgente,
		risultatoAtteso: '#t'
	},
	{
		id: 'atomo-simbolo',
		titolo: 'Un atomo simbolo',
		descrizione: 'Un simbolo e un atomo auto-valutante: il programma restituisce "simbolo".',
		sorgente: atomoSimboloSorgente,
		risultatoAtteso: 'simbolo'
	},
	{
		id: 'applicazione-addizione-binaria',
		titolo: '(+ 1 2)',
		descrizione: 'L\'operatore + somma due argomenti numerici.',
		sorgente: applicazioniAddizioneBinariaSorgente,
		risultatoAtteso: '3'
	},
	{
		id: 'applicazione-addizione-naria',
		titolo: '(+ 1 2 3 4 5)',
		descrizione: 'L\'operatore + somma tutti gli argomenti numerici.',
		sorgente: applicazioniAddizioneNariaSorgente,
		risultatoAtteso: '15'
	},
	{
		id: 'applicazione-aritmetiche-ricorsive',
		titolo: '(* (+ 1 2) (- 5 (/ 10 5)Nell))',
		descrizione: 'L\'operatore * moltiplica i risultati degli operatori + e -.',
		sorgente: applicazioniAritmeticheRicorsiveSorgente,
		risultatoAtteso: '9'
	},
	{
		id: 'errore-sottrazione-senza-argomenti',
		titolo: 'Errore: sottrazione senza argomenti',
		descrizione: "L'operatore - richiede almeno un argomento numerico.",
		sorgente: sottrazioneSenzaArgomentiSorgente,
		erroreAtteso: "'-' richiede almeno un argomento."
	}
];
