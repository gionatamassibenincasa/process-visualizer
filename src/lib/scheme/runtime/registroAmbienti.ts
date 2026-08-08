// file: src/lib/scheme/runtime/registroAmbienti.ts
/**
 * Modulo Registro Ambienti e Factory globale per gli ambienti Scheme.
 *
 * Mantiene l'elenco dei profili di ambiente disponibili e fornisce la funzione factory `creaAmbiente`
 * per istanziare dinamicamente gli ambienti di calcolo in base all'ID specificato.
 *
 * @module runtime/registroAmbienti
 * @example
 * ```typescript
 * import { creaAmbiente, getIdsAmbientiDisponibili } from './registroAmbienti';
 *
 * console.log(getIdsAmbientiDisponibili()); // ['minimo-numeri-naturali', 'per-divisione', 'standard']
 * const env = creaAmbiente('standard');
 * ```
 */

import { Ambiente } from './ambiente';
import { profiloMinimoNumeriNaturali } from './ambienteMinimoNumeriNaturali';
import { profiloPerDivisione } from './ambientePerDivisione';
import { profiloStandard } from './ambienteStandard';
import type { ProfiloAmbiente } from './profiloAmbiente';
import type { ValoreScheme } from './valori';

/**
 * Eccezione sollevata quando viene richiesto un ID di ambiente non registrato nel sistema.
 *
 * @example
 * ```typescript
 * try {
 *   creaAmbiente('ambiente-inesistente');
 * } catch (e) {
 *   if (e instanceof AmbienteNonTrovatoError) {
 *     console.error(e.idAmbiente);
 *   }
 * }
 * ```
 */
export class AmbienteNonTrovatoError extends Error {
	/**
	 * @param idAmbiente - L'ID dell'ambiente non trovato.
	 */
	constructor(public readonly idAmbiente: string) {
		super(`Ambiente con id "${idAmbiente}" non trovato tra i profili predefiniti.`);
		this.name = 'AmbienteNonTrovatoError';

		Object.setPrototypeOf(this, AmbienteNonTrovatoError.prototype);
	}
}

/**
 * Elenco globale dei profili di ambiente registrati nell'interprete.
 */
export const registroAmbienti: readonly ProfiloAmbiente[] = [
	profiloMinimoNumeriNaturali,
	profiloPerDivisione,
	profiloStandard
];

/**
 * Profilo di ambiente utilizzato di default se non diversamente specificato (`"standard"`).
 */
export const profiloAmbientePredefinito = profiloStandard;

/**
 * Factory di ambiente: restituisce una nuova istanza di `Ambiente` configurata in base all'ID del profilo.
 *
 * @param id - Identificatore del profilo dell'ambiente (default `"standard"`).
 * @returns Una nuova istanza di {@link Ambiente} popolata con le primitive del profilo.
 * @throws {@link AmbienteNonTrovatoError} Se l'ID specificato non è presente nel registro.
 * @example
 * ```typescript
 * const envMinimo = creaAmbiente('minimo-numeri-naturali');
 * const envStandard = creaAmbiente('standard');
 * ```
 */
export function creaAmbiente(id: string = 'standard'): Ambiente<ValoreScheme> {
	const profilo = registroAmbienti.find((p) => p.id === id);

	if (!profilo) {
		throw new AmbienteNonTrovatoError(id);
	}

	return profilo.crea();
}

/**
 * Restituisce l'elenco degli identificatori univoci di tutti i profili di ambiente disponibili.
 *
 * @returns Array readonly contenente gli ID registrati.
 * @example
 * ```typescript
 * const ids = getIdsAmbientiDisponibili(); // ["minimo-numeri-naturali", "per-divisione", "standard"]
 * ```
 */
export function getIdsAmbientiDisponibili(): readonly string[] {
	return registroAmbienti.map((profilo) => profilo.id);
}
