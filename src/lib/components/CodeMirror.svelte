<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { defaultKeymap } from '@codemirror/commands';

	interface Props {
		doc?: string;
	}

	let { doc = $bindable('') }: Props = $props();

	let container = $state<HTMLElement | null>(null);
	let editorView: EditorView | null = null;

	onMount(() => {
		if (!container) return;

		const state = EditorState.create({
			doc,
			extensions: [
				lineNumbers(),
				keymap.of(defaultKeymap),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						doc = update.state.doc.toString();
					}
				})
			]
		});

		editorView = new EditorView({
			state,
			parent: container
		});

		return () => {
			editorView?.destroy();
			editorView = null;
		};
	});

	$effect(() => {
		if (!editorView) return;

		const currentDoc = editorView.state.doc.toString();

		if (currentDoc === doc) return;

		editorView.dispatch({
			changes: {
				from: 0,
				to: editorView.state.doc.length,
				insert: doc
			}
		});
	});
</script>

<div class="editor-wrapper" bind:this={container}></div>

<style>
	.editor-wrapper {
		width: 100%;
		height: 100%;
	}
	:global(.cm-editor) {
		height: 100%;
	}
</style>