// file: runtime/profiloAmbiente.ts
import { Ambiente } from './ambiente';
import type { ValoreScheme } from './valori';

export interface ProfiloAmbiente {
	readonly id: string;
	readonly nome: string;
	readonly descrizione: string;

	/**
	 * Metodo polimorfico che ogni profilo implementa
	 * per istanziare ed estendere il proprio ambiente.
	 */
	crea(): Ambiente<ValoreScheme>;
}
