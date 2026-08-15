// file: src/lib/index.ts
/**
 * Punto di esportazione della libreria del visualizzatore di processi Scheme.
 *
 * @module process-visualizer
 */

export { default as CodeMirror } from './components/CodeMirror.svelte';
export { default as QandA } from './components/QandA.svelte';
export { default as SchemeStepperView } from './components/SchemeStepperView.svelte';
export { default as SplitPane } from './components/SplitPane.svelte';

export * from './data/faq/index';
export * from './scheme/ast/ast';
export * from './scheme/ast/atomo';
export * from './scheme/ast/coppia';
export * from './scheme/ast/formatter';
export * from './scheme/ast/lista';
export * from './scheme/ast/parser';
export * from './scheme/examples/catalog';
export * from './scheme/lexer/lexer';
export * from './scheme/lexer/token';
export * from './scheme/runtime/ambiente';
export * from './scheme/runtime/registroAmbienti';
export * from './scheme/runtime/stepper';
export * from './scheme/runtime/valori';
