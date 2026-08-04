import { TipoDiParole } from '../lexer/token';
import type { Parola } from '../lexer/token';
import { analizzatoreLessicale } from '../lexer/lexer';
import { Atomo, TipoAtomo } from './atomo';
import { Coppia } from './coppia';

export type TipoElementoLista = null | Atomo | Coppia | Lista;

export class Lista {
    private readonly _primaCoppia: Coppia | null;

    constructor(elementi: TipoElementoLista[] | null = null) {
        if (elementi === null || elementi.length === 0) {
            this._primaCoppia = null;
            return;
        }

        const [primo, ...resto] = elementi;
        this._primaCoppia = new Coppia(primo, new Lista(resto));
    }

    static listaVuota(): Lista {
        return new Lista(null);
    }

    static èLista(valore: unknown): valore is Lista {
        return valore instanceof Lista;
    }

    get primo(): TipoElementoLista | null {
        if (this._primaCoppia === null) {
            return null;
        }

        return this._primaCoppia.primo as TipoElementoLista;
    }

    get resto(): Lista | null {
        if (this._primaCoppia === null) {
            return null;
        }

        return this._primaCoppia.resto as Lista;
    }

    vuoto(): boolean {
        return this._primaCoppia === null;
    }

    preleva(indice: number): TipoElementoLista | null {
        if (indice < 0) {
            throw new Error('L\'indice deve essere maggiore o uguale a zero.');
        }

        return this._prelevaRicorsivo(indice);
    }

    toString(): string {
        const elementi: string[] = [];
        this._accumulaElementi(elementi);

        return `(${elementi.join(' ')})`;
    }

    static fromString(s: string): Lista {
        const parole = analizzatoreLessicale(s).filter((p: Parola) => p.tipo !== TipoDiParole.FineDelFile);
        if (parole.length === 0) {
            return Lista.listaVuota();
        }

        if (parole[0].tipo !== TipoDiParole.ParentesiAperta) {
            throw new Error('La stringa non rappresenta una lista valida: manca la parentesi aperta iniziale.');
        }

        const pos = { index: 1 };
        return Lista._parseTokens(parole, pos);
    }

    private static _formatElemento(elemento: TipoElementoLista | null): string {
        if (elemento === null) {
            return '()';
        }

        return elemento.toString();
    }

    private _prelevaRicorsivo(indice: number): TipoElementoLista | null {
        if (this.vuoto()) {
            throw new Error('Indice fuori dai limiti della lista.');
        }

        if (indice === 0) {
            return this.primo;
        }

        if (this.resto === null) {
            throw new Error('Indice fuori dai limiti della lista.');
        }

        return this.resto._prelevaRicorsivo(indice - 1);
    }

    private _accumulaElementi(elementi: string[]): void {
        if (this.vuoto()) {
            return;
        }

        elementi.push(Lista._formatElemento(this.primo));
        this.resto?._accumulaElementi(elementi);
    }

    private static _tokenToElemento(token: Parola): null | Atomo {
        switch (token.tipo) {
            case TipoDiParole.Numero:
                return new Atomo(token.valore as number, TipoAtomo.NUMERO);
            case TipoDiParole.Booleano:
                return new Atomo(token.valore as boolean, TipoAtomo.BOOLEANO);
            case TipoDiParole.Stringa:
                return new Atomo(token.valore as string, TipoAtomo.STRINGA);
            case TipoDiParole.Simbolo:
                return new Atomo(token.valore as string, TipoAtomo.SIMBOLO);
            default:
                return token.valore === null ? null : new Atomo(String(token.valore), TipoAtomo.SIMBOLO);
        }
    }

    private static _parseTokens(parole: Parola[], pos: { index: number }): Lista {
        const espressioni: TipoElementoLista[] = [];

        while (pos.index < parole.length) {
            const parola = parole[pos.index];
            pos.index++;

            if (parola.tipo === TipoDiParole.ParentesiChiusa) {
                return new Lista(espressioni);
            }

            if (parola.tipo === TipoDiParole.ParentesiAperta) {
                espressioni.push(Lista._parseTokens(parole, pos));
                continue;
            }

            espressioni.push(Lista._tokenToElemento(parola));
        }

        throw new Error('Sintassi della lista non valida: parentesi chiusa mancante.');
    }
}

export function listaVuota(): Lista {
    return Lista.listaVuota();
}

export function lista(...elementi: TipoElementoLista[]): Lista {
    return new Lista(elementi);
}