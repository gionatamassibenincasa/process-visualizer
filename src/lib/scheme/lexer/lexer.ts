import { TipoDiParole } from './token';
import type { Parola } from './token';

export { TipoDiParole } from './token';
export type { Parola } from './token';

export function analizzatoreLessicale(sorgente: string): Parola[] {
	const parole: Parola[] = [];
	let i = 0;

	while (i < sorgente.length) {
		const char = sorgente[i];

		// 1. Ignora spazi bianchi
		if (/\s/.test(char)) {
			i++;
			continue;
		}

		// 2. Ignora i commenti (da ';' a fine riga)
		if (char === ';') {
			while (i < sorgente.length && sorgente[i] !== '\n') {
				i++;
			}
			continue;
		}

		// 3. Delimitatori e caratteri singoli
		if (char === '(') {
			parole.push({ tipo: TipoDiParole.ParentesiAperta, valore: '(' });
			i++;
			continue;
		}
		if (char === ')') {
			parole.push({ tipo: TipoDiParole.ParentesiChiusa, valore: ')' });
			i++;
			continue;
		}
		if (char === "'") {
			parole.push({ tipo: TipoDiParole.Citazione, valore: "'" });
			i++;
			continue;
		}

		// 4. Stringhe "..."
		if (char === '"') {
			let str = '';
			i++; // salta il " iniziale
			while (i < sorgente.length && sorgente[i] !== '"') {
				str += sorgente[i];
				i++;
			}
			i++; // salta il " finale
			parole.push({ tipo: TipoDiParole.Stringa, valore: str });
			continue;
		}

		// 5. Token composti (Numeri, Booleani, Simboli, Punto)
		const start = i;
		while (
			i < sorgente.length &&
			!/\s/.test(sorgente[i]) &&
			!['(', ')', "'", '"', ';'].includes(sorgente[i])
		) {
			i++;
		}

		const testo = sorgente.substring(start, i);

		if (testo === '.') {
			parole.push({ tipo: TipoDiParole.Punto, valore: '.' });
		} else if (testo === '#t' || testo === '#true' || testo === '#vero') {
			parole.push({ tipo: TipoDiParole.Booleano, valore: true });
		} else if (testo === '#f' || testo === '#false' || testo === '#falso') {
			parole.push({ tipo: TipoDiParole.Booleano, valore: false });
		} else if (!isNaN(Number(testo)) && testo.trim() !== '') {
			parole.push({ tipo: TipoDiParole.Numero, valore: Number(testo) });
		} else {
			parole.push({ tipo: TipoDiParole.Simbolo, valore: testo });
		}
	}

	parole.push({ tipo: TipoDiParole.FineDelFile, valore: null });
	return parole;
}
