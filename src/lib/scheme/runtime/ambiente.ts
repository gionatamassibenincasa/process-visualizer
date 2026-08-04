export class Ambiente<Valore = unknown> {
	private padre: Ambiente<Valore> | null;
	private tabella: Map<string, Valore>;

	constructor(padre: Ambiente<Valore> | null = null) {
		this.padre = padre;
		this.tabella = new Map<string, Valore>();
	}

	/**
	 * Cerca un simbolo nello scope corrente o nei padri.
	 * Restituisce undefined se non trovato o se non gestito.
	 */
	applica(simbolo: string): Valore | null {
		if (this.tabella.has(simbolo)) {
			return this.tabella.get(simbolo)!;
		}

		if (this.padre !== null) {
			return this.padre.applica(simbolo);
		}

		throw new Error(`Errore di Runtime: Simbolo '${simbolo}' non definito nello scope.`);
	}

	inserisci(simbolo: string, valore: Valore): void {
		this.tabella.set(simbolo, valore);
	}

	isVuoto(): boolean {
		return this.tabella.size === 0;
	}

	numElementi(): number {
		return this.tabella.size;
	}
}
