// file: runtime/registroAmbienti.ts
import { Ambiente } from './ambiente';
import { profiloMinimoNumeriNaturali } from './ambienteMinimoNumeriNaturali';
import { profiloStandard } from './ambienteStandard';
import type { ProfiloAmbiente } from './profiloAmbiente';
import type { ValoreScheme } from './valori';

/**
 * Errore personalizzato per una gestione pulita e tipizzata degli ambienti non trovati.
 */
export class AmbienteNonTrovatoError extends Error {
    constructor(public readonly idAmbiente: string) {
        super(`Ambiente con id "${idAmbiente}" non trovato tra i profili predefiniti.`);
        this.name = 'AmbienteNonTrovatoError';

        // Ripristina il prototype chain per gli ambienti ES5/TS (best practice per Custom Errors)
        Object.setPrototypeOf(this, AmbienteNonTrovatoError.prototype);
    }
}

/**
 * Registro globale che contiene i vari profili di ambiente.
 */
export const registroAmbienti: readonly ProfiloAmbiente[] = [
    profiloMinimoNumeriNaturali,
    profiloStandard
];

export const profiloAmbientePredefinito = profiloStandard;

/**
 * Factory globale: delega polimorficamente la creazione dell'ambiente 
 * al profilo corrispondente all'id richiesto.
 */
export function creaAmbiente(id: string = 'standard'): Ambiente<ValoreScheme> {
    const profilo = registroAmbienti.find((p) => p.id === id);

    if (!profilo) {
        throw new AmbienteNonTrovatoError(id);
    }

    // Chiamata polimorfica al metodo del profilo
    return profilo.crea();
}

/**
 * Restituisce l'elenco di tutti gli ID degli ambienti disponibili.
 * Sfrutta `const assertion` per garantire un array readonly di ID.
 */
export function getIdsAmbientiDisponibili(): readonly string[] {
    return registroAmbienti.map((profilo) => profilo.id);
}
