# Process visualizer

Una web app statica per la didattica dei linguaggi di programmazione. 

L'editor permette di descrivere il programma. Sia esso descritto con:

- un linguaggio imperativo, da eseguire su una macchina RAM,
- un linguaggio funzionale, che riscrive espressioni sul modello del Lambda Calcolo con l'introduzione di ambienti,
- un linguaggio logico che procede per unificazione e risoluzione,
- un linguaggio basato sul modello ad attori,
- un linguaggio basato sul modello dataflow.

La prima versione è dedicata ad un sottoinsieme ridotto del linguaggio Scheme e non ha supporto per l'Input/Output.

## Idea generale

La porzione visibile dello schermo è divisa in due parti, orizzontali o verticali, che possono essere ridimensionate fino a scomparsa.

Il componente in alto, o a sinistra, è l'editor (CodeMirror 6), in basso o a destra, in base alla scelta dell'utente, c'è l'output oppure lo stepper che permette l'esecuzione del codice passo passo.


## Componenti web

### Editor

L'editor è realizzato con CodeMirror 6 e permette di evidenziare la sintassi del linguaggio.
Per l'evidenziazione saranno generati, se necessario, lexer appositi usando le soluzioni standard di CodeMirror.

### Output

Mostra il valore restituito dal programma

### Stepper

Mostra l'albero sintattico e l'ambiente, o lo stato della macchina, ad ogni passo di interpretazione/valutazione.

## Componenti del modello

### Analizzatore lessicale

Un analizzatore lessicale divide in il testo in token, se strettamente necessario

### Analizzatore sintattico

Produce un albero sintattico. Mantiene le informazioni di contesto del codice sorgente originario: riga, colonna...
I nodi dell'AST (Abstract Syntax Tree) sono tipizzati in base al linguaggio.

### Interprete

L'interprete valuta l'albero sintattico salvando in un oggetto ogni passo della valutazione

## Vincoli

### Vincoli funzionali

1. tutto deve girare interamente nel browser.

### Vincoli non funzionali

1. Linguaggio TypeScript in Svelte 5

#### Vincoli sulla codifica Svelte

- *Use Runes exclusively:* Never use `let count = 0` for reactivity or `export let prop` for props. Use `$state()` and `$props()` instead.
- *Avoid event modifiers:* Do not use legacy syntax like `on:click|preventDefault`. Use standard attributes like `onclick={handler}` and handle event modifications inside the JavaScript function.
- *Drop component events:* Stop using `createEventDispatcher`. Pass callback functions as standard props instead (e.g., `onload={handleLoad}`).
- *Leverage snippets:* Replace `<slot />` and `let:item` layout structures with the `{#snippet}` syntax.
- *Write standard TypeScript:* Avoid highly experimental compiler tricks. Stick to standard TypeScript 5.x/6.x features.
