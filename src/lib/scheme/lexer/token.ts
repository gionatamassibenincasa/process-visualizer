export enum TipoDiParole {
	ParentesiAperta = 'LPAREN',
	ParentesiChiusa = 'RPAREN',
	Citazione = 'QUOTE',
	Punto = 'DOT',
	Simbolo = 'SYMBOL',
	Numero = 'NUMBER',
	Booleano = 'BOOLEAN',
	Stringa = 'STRING',
	FineDelFile = 'EOF'
}

export interface Parola {
	tipo: TipoDiParole;
	valore: number | boolean | string | null;
}
