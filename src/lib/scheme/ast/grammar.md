# Grammatica del Sottoinsieme Scheme

## Scopo

Questo documento definisce la grammatica di riferimento per il linguaggio.
La specifica e usata come base unica per:

- modello AST
- lexer
- parser
- formatter
- stepper

Tutti i costrutti descritti in questa grammatica devono avere una rappresentazione esplicita nell'AST.

## Convenzioni

- Notazione: EBNF semplificata.
- Simbolo iniziale: Programma.
- Le parole chiave standard e le estensioni italiane sono entrambe valide dove indicato.

## Grammatica (EBNF)

```ebnf
Programma        ::= Forma*
Forma            ::= Definizione | Espressione

Definizione      ::= "(" KwDefine Variabile Espressione ")"
KwDefine         ::= "define" | "definisci"
Variabile        ::= Identificatore

Espressione      ::= Costante
                  | Variabile
                  | Citazione
                  | Lambda
                  | If
                  | EspressioneDerivata
                  | Applicazione

Costante         ::= Atomo
Atomo            ::= Booleano | Numero | Stringa | Simbolo

Citazione        ::= "(" KwQuote Datum ")" | "'" Datum
KwQuote          ::= "quote" | "cita"

Lambda           ::= "(" "lambda" Parametri Corpo ")"
Parametri        ::= Variabile | "(" Variabile* ")"
Corpo            ::= Forma+

If               ::= "(" kwIf Espressione Espressione Espressione? ")"
KwIf             ::= "if" | "se"

EspressioneDerivata ::= And | Or | Cond
And              ::= "(" KwAnd Espressione* ")"
KwAnd            ::= "and" | "e"
Or               ::= "(" KwOr Espressione* ")"
KwOr             ::= "or" | "o"
Cond             ::= "(" "cond" ClausolaCond+ ")"
ClausolaCond     ::= "(" TestCond Espressione+ ")"
TestCond         ::= Espressione | KwElse
KwElse           ::= "else" | "altrimenti"

Applicazione     ::= "(" Espressione Espressione* ")"

Datum            ::= Atomo | Lista | CoppiaPuntata | Abbreviazione
Lista            ::= "(" Datum* ")"
CoppiaPuntata    ::= "(" Datum+ "." Datum ")"
Abbreviazione    ::= "'" Datum
Simbolo          ::= Identificatore

Booleano         ::= "#t" | "#f" | "#true" | "#false" | "#vero" | "#falso"
Numero           ::= ["-"|"+"] Cifra+
Stringa          ::= '"' CarattereStringa* '"'

Identificatore   ::= Iniziale Successivo* | "+" | "-" | "..."
Iniziale         ::= Lettera | "!" | "$" | "%" | "&" | "*" | "/" | ":" | "<" | "=" | ">" | "?" | "~" | "_" | "^"
Successivo       ::= Iniziale | Cifra | "." | "+" | "-"
Lettera          ::= "a".."z" | "A".."Z"
Cifra            ::= "0".."9"

CarattereStringa ::= qualunque carattere eccetto '"' (escape da specificare)
```

## Terminali estesi

| Categoria       | Forme supportate                     |
| --------------- | ------------------------------------ |
| Definizione     | define, definisci                    |
| Citazione       | quote, cita, abbreviazione con '     |
| If              | if, se                               |
| And             | and, e                               |
| Or              | or, o                                |
| Cond else alias | else, altrimenti (normalizzati a #t) |
| Booleani        | #t, #f, #true, #false, #vero, #falso |

## Tabella di tracciabilita semantica

| Costrutto grammaticale | AST richiesto                    | Lexer (token attesi)                                  | Parser (regola)     | Formatter (output canonico)                   | Stepper (semantica minima)                            |
| ---------------------- | -------------------------------- | ----------------------------------------------------- | ------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Programma              | NodoProgramma con forme ordinate | sequenza di token fino a EOF                          | parseProgramma      | stampa una forma per volta o blocco           | esecuzione sequenziale forme                          |
| Definizione            | DefineAST(nome, valore)          | LPAREN, SYMBOL(define/definisci), SYMBOL, ..., RPAREN | parseDefinizione    | usa forma canonica define                     | introduce binding in ambiente                         |
| Variabile/Simbolo      | AtomoAST o SimboloAST            | SYMBOL                                                | parseIdentificatore | nome simbolo invariato                        | lookup ambiente                                       |
| Atomo                  | AtomoAST(TipoAtomo)              | NUMBER, BOOLEAN, STRING, SYMBOL                       | parseAtomo          | rappresentazione canonica di Atomo.toString() | valore auto-valutante o riferimento simbolico         |
| Costante Booleana      | AtomoAST boolean                 | BOOLEAN                                               | parseCostante       | #t o #f canonico                              | valore auto-valutante                                 |
| Costante Numerica      | AtomoAST numero                  | NUMBER                                                | parseCostante       | numero normalizzato                           | valore auto-valutante                                 |
| Costante Stringa       | AtomoAST stringa                 | STRING                                                | parseCostante       | stringa con doppi apici                       | valore auto-valutante                                 |
| Citazione              | CitazioneAST(expr)               | QUOTE oppure LPAREN SYMBOL(quote/cita)                | parseCitazione      | preferenza per abbreviazione o quote canonico | nessuna valutazione interna del datum                 |
| Lambda                 | LambdaAST(parametri, corpo)      | LPAREN SYMBOL(lambda) ... RPAREN                      | parseLambda         | forma canonica lambda                         | crea chiusura lessicale                               |
| If                     | IfAST(test, then, else?)         | LPAREN SYMBOL(if) ... RPAREN                          | parseIf             | forma canonica if                             | valuta test poi ramo selezionato                      |
| And                    | AndAST(expr*)                    | LPAREN SYMBOL(and) ... RPAREN                         | parseAnd            | forma canonica and                            | short-circuit su falso                                |
| Or                     | OrAST(expr*)                     | LPAREN SYMBOL(or) ... RPAREN                          | parseOr             | forma canonica or                             | short-circuit su vero                                 |
| Cond                   | CondAST(clausole)                | LPAREN SYMBOL(cond) ... RPAREN                        | parseCond           | forma canonica cond                           | prima clausola vera; else/altrimenti equivalgono a #t |
| Applicazione           | ListaAST o ApplyAST              | LPAREN ... RPAREN                                     | parseApplicazione   | stampa prefissa                               | valuta operatore e argomenti                          |
| Lista Datum            | ListaAST/Lista runtime           | LPAREN ... RPAREN                                     | parseListaDatum     | parentesi e spazi canonici                    | valore strutturato                                    |
| Coppia puntata         | CoppiaAST/Coppia runtime         | LPAREN, DOT, RPAREN                                   | parseCoppiaPuntata  | (a . b)                                       | valore strutturato                                    |

## Tabella di tracciabilita lessicale

| Token logico | Lessico previsto           | Note di implementazione        |
| ------------ | -------------------------- | ------------------------------ |
| LPAREN       | (                          | delimitatore lista             |
| RPAREN       | )                          | delimitatore lista             |
| QUOTE        | '                          | abbreviazione quote            |
| DOT          | .                          | coppia puntata                 |
| SYMBOL       | identificatori e keyword   | distinzione keyword in parser  |
| NUMBER       | interi con segno opzionale | estensione a reali opzionale   |
| BOOLEAN      | #t/#f e varianti estese    | normalizzare in parser/AST     |
| STRING       | "..."                      | gestione escape da specificare |
| EOF          | fine input                 | token sintetico                |

## Note di conformita

- Se un costrutto e dichiarato in questa grammatica, deve esistere nel modello AST e avere una regola parser dedicata.
- Il concetto di Atomo e vincolato al modello in ast/atomo.ts: NUMERO, BOOLEANO, STRINGA, SIMBOLO.
- Se un token e presente in grammatica ma non ancora nel lexer corrente, va tracciato come TODO esplicito fino a implementazione.
- Il formatter deve produrre una forma canonica deterministica per ogni nodo AST.
- Lo stepper deve poter spiegare una riduzione per ogni forma valutabile.

## Controllo Step 1 Ready

### Esito

Step 1 non e ancora pronto al passaggio successivo.

I file legacy sono stati rimossi: la pipeline corrente e composta da lexer, parser, AST, formatter e stepper.

### Criteri di ingresso Step 1

| Criterio                                                              | Stato    | Evidenza                                                          |
| --------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Grammatica unificata e coerente con Atomo                             | OK       | Atomo allineato a NUMERO, BOOLEANO, STRINGA, SIMBOLO              |
| Baseline tecnica tracciata (lexer, parser, AST, formatter, stepper)   | PARZIALE | Componenti presenti ma con implementazioni eterogenee             |
| Mappatura specifica -> implementazione senza duplicazioni strutturali | KO       | Parser legacy ridefinisce strutture gia presenti nell'AST runtime |
| Gap documentati con priorita e azioni                                 | PARZIALE | Gap rilevati, manca checklist operativa con stato task            |

### Gap bloccanti rilevati

1. Parser non allineato alla grammatica completa:
   manca il parsing strutturato per Programma, Lambda, Citazione estesa, Applicazione canonica e CoppiaPuntata come regole dedicate nel nuovo AST.

2. Modello AST incompleto rispetto alla tabella semantica:
   non sono presenti nodi dedicati per Programma e Lambda; Applicazione e attualmente implicita nella lista.

3. Stepper del nuovo runtime ancora da riallineare alla grammatica:
   la riduzione non implementa ancora un ciclo completo expand/reduce per tutte le forme dichiarate.

4. Formatter non copre tutti i costrutti dichiarati:
   output canonico non ancora definito per tutte le produzioni della grammatica estesa.

### Condizioni per dichiarare Step 1 Ready

1. Completare i nodi AST mancanti dichiarati in tabella semantica.
2. Introdurre nel parser le regole dedicate: Programma, Lambda, Citazione completa, Applicazione, CoppiaPuntata.
3. Aggiornare formatter e stepper al medesimo perimetro di costrutti.
4. Aggiungere checklist con stato TODO/IN PROGRESS/DONE per ogni riga della tabella semantica.
