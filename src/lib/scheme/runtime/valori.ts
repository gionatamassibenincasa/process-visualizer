// file: runtime/valori.ts
import { NodoAST } from '../ast/ast';
import type { Ambiente } from './ambiente';

export type ValoreAtomicoScheme = number | boolean | string;

export type ListaScheme = ValoreScheme[];

export type FunzionePrimitiva = (...args: ValoreScheme[]) => ValoreScheme;

export interface Chiusura {
    parametri: string[];
    corpo: NodoAST[];
    ambienteChiusura: Ambiente<ValoreScheme>;
}

export type ValoreScheme =
    | ValoreAtomicoScheme
    | FunzionePrimitiva
    | Chiusura
    | ListaScheme
    | null;