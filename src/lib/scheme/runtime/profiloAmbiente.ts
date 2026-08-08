// file: src/lib/scheme/runtime/profiloAmbiente.ts
/**
 * Interfaccia per i profili di ambiente predefiniti dell'interprete Scheme.
 *
 * Consente di registrare e istanziare ambienti di calcolo con primitive ed estensioni specifiche
 * (ad esempio ambiente standard, ambiente minimo numeri naturali, ambiente per la divisione).
 *
 * @module runtime/profiloAmbiente
 * @example
 * ```typescript
 * import type { ProfiloAmbiente } from './profiloAmbiente';
 * import { Ambiente } from './ambiente';
 * import type { ValoreScheme } from './valori';
 *
 * const mioProfilo: ProfiloAmbiente = {
 *   id: 'custom',
 *   nome: 'Ambiente Personalizzato',
 *   descrizione: 'Ambiente di prova con primitive personalizzate',
 *   crea: () => new Ambiente<ValoreScheme>()
 * };
 * ```
 */

import { Ambiente } from './ambiente';
import type { ValoreScheme } from './valori';

/**
 * Contratto per la definizione di un profilo di ambiente registrabile nel `RegistroAmbienti`.
 */
export interface ProfiloAmbiente {
	/** Identificatore univoco del profilo (es. `"standard"`, `"minimo-numeri-naturali"`). */
	readonly id: string;
	/** Nome leggibile del profilo da mostrare nelle interfacce. */
	readonly nome: string;
	/** Descrizione dettagliata dello scopo e delle primitive fornite dal profilo. */
	readonly descrizione: string;

	/**
	 * Factory method che istanzia e configura un nuovo `Ambiente` popolato con le primitive del profilo.
	 *
	 * @returns Una nuova istanza di {@link Ambiente} indipendente.
	 */
	crea(): Ambiente<ValoreScheme>;
}
