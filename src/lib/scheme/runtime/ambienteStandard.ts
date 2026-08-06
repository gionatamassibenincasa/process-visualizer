// file: runtime/ambienteStandard.ts
import { Ambiente } from './ambiente';
import type { FunzionePrimitiva, ListaScheme, ValoreScheme } from './valori';
import type { ProfiloAmbiente } from './profiloAmbiente';

function richiediNumero(valore: ValoreScheme, operatore: string): number {
	if (typeof valore !== 'number') {
		throw new Error(`'${operatore}' richiede argomenti numerici.`);
	}

	return valore;
}

function richiediLista(valore: ValoreScheme, operatore: string): ListaScheme {
	if (!Array.isArray(valore)) {
		throw new Error(`'${operatore}' richiede una lista.`);
	}

	return valore;
}

function creaLista(...elementi: ValoreScheme[]): ListaScheme {
	return elementi;
}

function anteponi(elemento: ValoreScheme, lista: ValoreScheme): ListaScheme {
	return [elemento, ...richiediLista(lista, 'anteponi')];
}

function primo(lista: ValoreScheme): ValoreScheme {
	const elementi = richiediLista(lista, 'primo');
	if (elementi.length === 0) {
		throw new Error("'primo' non e definito per la lista vuota.");
	}

	return elementi[0];
}

function resto(lista: ValoreScheme): ListaScheme {
	const elementi = richiediLista(lista, 'resto');
	if (elementi.length === 0) {
		throw new Error("'resto' non e definito per la lista vuota.");
	}

	return elementi.slice(1);
}

function èListaVuota(valore: ValoreScheme): boolean {
	return Array.isArray(valore) && valore.length === 0;
}

function èAtomo(valore: ValoreScheme): boolean {
	return !Array.isArray(valore);
}

function èZero(valore: ValoreScheme): boolean {
	return richiediNumero(valore, 'zero?') === 0;
}

function successore(valore: ValoreScheme): number {
	return richiediNumero(valore, 'successore') + 1;
}

function predecessore(valore: ValoreScheme): number {
	return richiediNumero(valore, 'predecessore') - 1;
}

export function creaAmbiente(): Ambiente<ValoreScheme> {
	const env = new Ambiente<ValoreScheme>();

	// Operatori Aritmetici
	env.inserisci('+', (...args) =>
		args.map((arg) => richiediNumero(arg, '+')).reduce((totale, valore) => totale + valore, 0)
	);
	env.inserisci('-', (...args) => {
		if (args.length === 0) {
			throw new Error("'-' richiede almeno un argomento.");
		}

		const [primoArgomento, ...restoArgomenti] = args.map((arg) => richiediNumero(arg, '-'));
		return restoArgomenti.reduce((totale, valore) => totale - valore, primoArgomento);
	});
	env.inserisci('*', (...args) =>
		args.map((arg) => richiediNumero(arg, '*')).reduce((totale, valore) => totale * valore, 1)
	);
	env.inserisci('/', (...args) => {
		if (args.length !== 2) {
			throw new Error("'/' richiede esattamente due argomenti.");
		}

		return richiediNumero(args[0], '/') / richiediNumero(args[1], '/');
	});

	// Confronti e Logica
	env.inserisci('=', (a, b) => Object.is(a, b));
	env.inserisci('<', (a, b) => richiediNumero(a, '<') < richiediNumero(b, '<'));
	env.inserisci('>', (a, b) => richiediNumero(a, '>') > richiediNumero(b, '>'));
	env.inserisci('<=', (a, b) => richiediNumero(a, '<=') <= richiediNumero(b, '<='));
	env.inserisci('>=', (a, b) => richiediNumero(a, '>=') >= richiediNumero(b, '>='));
	env.inserisci('not', (valore) => !valore);

	// Costanti
	env.inserisci('#t', true);
	env.inserisci('#f', false);

	// Liste: ogni alias punta alla stessa primitiva per mantenere la compatibilita Scheme.
	const lista: FunzionePrimitiva = creaLista;
	const anteponiLista: FunzionePrimitiva = anteponi;
	const primoElemento: FunzionePrimitiva = primo;
	const restoLista: FunzionePrimitiva = resto;
	const èLista: FunzionePrimitiva = (valore) => Array.isArray(valore);
	const èListaVuotaPrimitiva: FunzionePrimitiva = èListaVuota;
	const èAtomoPrimitiva: FunzionePrimitiva = èAtomo;
	const èZeroPrimitiva: FunzionePrimitiva = èZero;
	const successorePrimitiva: FunzionePrimitiva = successore;
	const predecessorePrimitiva: FunzionePrimitiva = predecessore;
	const uguale: FunzionePrimitiva = (a, b) => Object.is(a, b);
	const listaVuota: ListaScheme = [];

	env.inserisci('lista-vuota', listaVuota);
	env.inserisci('atomo?', èAtomoPrimitiva);
	env.inserisci('zero?', èZeroPrimitiva);
	env.inserisci('successore', successorePrimitiva);
	env.inserisci('add1', successorePrimitiva);
	env.inserisci('s', successorePrimitiva);
	env.inserisci('predecessore', predecessorePrimitiva);
	env.inserisci('sub1', predecessorePrimitiva);
	env.inserisci('p', predecessorePrimitiva);
	env.inserisci('lista?', èLista);
	env.inserisci('list?', èLista);
	env.inserisci('lista-vuota?', èListaVuotaPrimitiva);
	env.inserisci('null?', èListaVuotaPrimitiva);
	env.inserisci('uguale?', uguale);
	env.inserisci('eq?', uguale);
	env.inserisci('primo', primoElemento);
	env.inserisci('car', primoElemento);
	env.inserisci('resto', restoLista);
	env.inserisci('cdr', restoLista);
	env.inserisci('anteponi', anteponiLista);
	env.inserisci('cons', anteponiLista);
	env.inserisci('lista', lista);
	env.inserisci('list', lista);

	return env;
}

export const profiloStandard: ProfiloAmbiente = {
	id: 'standard',
	nome: 'Standard',
	descrizione: 'Espone primitive aritmetiche, logiche e per le liste.',

	crea(): Ambiente<ValoreScheme> {
		return creaAmbiente();
	}
};
