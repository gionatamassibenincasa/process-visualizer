<script lang="ts">
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { defaultKeymap } from '@codemirror/commands';
	import { fromAction } from 'svelte/attachments';

	interface Props {
		doc?: string;
	}

	let { doc = $bindable('') }: Props = $props();

	function syncEditor(container: HTMLElement, initialDoc: string) {
		const state = EditorState.create({
			doc: initialDoc,
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

		const editorView = new EditorView({
			state,
			parent: container
		});

		return {
			update(nextDoc: string) {
				const currentDoc = editorView.state.doc.toString();

				if (currentDoc === nextDoc) return;

				editorView.dispatch({
					changes: {
						from: 0,
						to: editorView.state.doc.length,
						insert: nextDoc
					}
				});
			},
			destroy() {
				editorView.destroy();
			}
		};
	}
</script>

<div class="editor-wrapper" {@attach fromAction(syncEditor, () => doc)}></div>

<style>
	.editor-wrapper {
		width: 100%;
		height: 100%;
	}

	.editor-wrapper :global(.cm-editor) {
		height: 100%;
	}

	.editor-wrapper :global(.cm-editor .cm-content) {
		caret-color: #f8fafc;
	}

	.editor-wrapper :global(.cm-editor .cm-cursor) {
		border-left: 2px solid #f8fafc;
	}

	.editor-wrapper :global(.cm-editor.cm-focused .cm-content) {
		caret-color: #38bdf8;
	}

	.editor-wrapper :global(.cm-editor.cm-focused .cm-cursor) {
		border-left-color: #38bdf8;
	}
</style>