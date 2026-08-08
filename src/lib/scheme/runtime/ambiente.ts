// file: src/lib/scheme/runtime/ambiente.ts
/**
 * Modulo di gestione dell'Ambiente di calcolo (Environment & Lexical Scoping) per Scheme.
 *
 * Implementa la gerarchia di scope con ereditarietà dal padre e la tabella dei binding dei simboli.
 * Fornisce inoltre supporto per catturare istantanee dello stato dell'ambiente (`SnapshotAmbiente`)
 * usate nella visualizzazione dell'esecuzione.
 *
 * @module runtime/ambiente
 * @example
 * ```typescript
 * import { Ambiente } from './ambiente';
 *
 * const envGlobale = new Ambiente<number>();
 * envGlobale.inserisci('x', 10);
 *
 * const envLocale = new Ambiente<number>(envGlobale);
 * console.log(envLocale.applica('x')); // 10
 * ```
 */

/**
 * Snapshot dei binding (coppie simbolo-valore serializzato) per un singolo livello di scope.
 */
export interface SnapshotScopeAmbiente {
	/** Mappa dei legami simbolo -> rappresentazione testuale del valore. */
	binding: Record<string, string>;
}

/**
 * Snapshot completo dell'ambiente a un determinato passo, rappresentato come catena ordinata di scope.
 */
export interface SnapshotAmbiente {
	/** Catena degli scope, dal più esterno (radice) a quello più interno. */
	scope: SnapshotScopeAmbiente[];
}

/**
 * Gestisce l'ambiente di esecuzione e la risoluzione dei simboli con scoping lessicale.
 *
 * Supporta la concatenazione di ambienti padre-figlio per la ricerca ricorsiva dei simboli.
 *
 * @typeParam Valore - Il tipo di dato memorizzato nell'ambiente (tipicamente {@link ValoreScheme}).
 * @example
 * ```typescript
 * const env = new Ambiente<number>();
 * env.inserisci('a', 42);
 * console.log(env.applica('a')); // 42
 * ```
 */
export class Ambiente<Valore = unknown> {
	private padre: Ambiente<Valore> | null;
	private tabella: Map<string, Valore>;

	/**
	 * Crea un nuovo ambiente di calcolo.
	 *
	 * @param padre - L'ambiente genitore da cui ereditare lo scope, oppure `null` per la radice.
	 */
	constructor(padre: Ambiente<Valore> | null = null) {
		this.padre = padre;
		this.tabella = new Map<string, Valore>();
	}

	/**
	 * Cerca un simbolo nello scope corrente. Se non presente, delega la ricerca all'ambiente padre.
	 *
	 * @param simbolo - Nome del simbolo da cercare.
	 * @returns Il valore associato al simbolo.
	 * @throws Error Se il simbolo non viene trovato in alcuno scope della catena.
	 * @example
	 * ```typescript
	 * const val = env.applica('pippo');
	 * ```
	 */
	applica(simbolo: string): Valore {
		if (this.tabella.has(simbolo)) {
			return this.tabella.get(simbolo)!;
		}

		if (this.padre !== null) {
			return this.padre.applica(simbolo);
		}

		throw new Error(`Errore di Runtime: Simbolo '${simbolo}' non definito nello scope.`);
	}

	/**
	 * Definisce o sovrascrive un legame (binding) per un simbolo nello scope corrente.
	 *
	 * @param simbolo - Nome del simbolo.
	 * @param valore - Valore da associare al simbolo.
	 * @example
	 * ```typescript
	 * env.inserisci('x', 100);
	 * ```
	 */
	inserisci(simbolo: string, valore: Valore): void {
		this.tabella.set(simbolo, valore);
	}

	/**
	 * Verifica se la tabella dei legami dello scope corrente è vuota.
	 *
	 * @returns `true` se non vi sono legami definiti nello scope locale.
	 */
	isVuoto(): boolean {
		return this.tabella.size === 0;
	}

	/**
	 * Restituisce il numero di legami definiti nello scope locale.
	 *
	 * @returns Il numero totale di chiavi presenti nello scope corrente.
	 */
	numElementi(): number {
		return this.tabella.size;
	}

	/**
	 * Genera un'istantanea (snapshot) dell'intero albero di scope serializzando i valori.
	 *
	 * @param serializzaValore - Funzione per convertire un valore di runtime in stringa.
	 * @returns Oggetto {@link SnapshotAmbiente} pronto per l'ispezione o la visualizzazione nella UI.
	 * @example
	 * ```typescript
	 * const snap = env.istantanea((v) => String(v));
	 * ```
	 */
	istantanea(serializzaValore: (valore: Valore) => string): SnapshotAmbiente {
		const scopePadre = this.padre?.istantanea(serializzaValore).scope ?? [];
		const binding = Object.fromEntries(
			[...this.tabella.entries()]
				.sort(([simboloA], [simboloB]) => simboloA.localeCompare(simboloB))
				.map(([simbolo, valore]) => [simbolo, serializzaValore(valore)])
		);

		return {
			scope: [...scopePadre, { binding }]
		};
	}
}
