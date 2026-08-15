<!-- file: src/routes/+page.svelte -->
<script lang="ts">
	import SplitPane from '#lib/components/SplitPane.svelte';
	import CodeMirror from '#lib/components/CodeMirror.svelte';
	import StepperView from '#lib/components/SchemeStepperView.svelte';
	import type { EsempioScheme } from '#lib/scheme/examples/catalog';
	import { FormatterScheme, type SnapshotPassoStepping } from '#lib/scheme/ast/formatter';
	import { StepperScheme } from '#lib/scheme/runtime/stepper';

	interface Props {
		data: {
			esempi?: readonly EsempioScheme[];
		};
	}

	let { data }: Props = $props();
	let esempiScheme = $derived<readonly EsempioScheme[]>(data?.esempi ?? []);

	// Codice Scheme iniziale
	let code = $state(
		`; ambiente: minimo-numeri-naturali\n(definisci addizione\n  (lambda (n m)\n    (cond\n      ((zero? m) n)\n      (altrimenti (s (addizione n (p m)))))))\n\n(addizione 5 3)`
	);
	let direction = $state<'horizontal' | 'vertical'>('horizontal');
	let rightMode = $state<'output' | 'stepper'>('stepper');
	let selectedExampleId = $state('');

	// Stato dell'esecuzione
	let executionTimeline = $state<SnapshotPassoStepping[]>([]);
	let currentStepIndex = $state(0);
	let finalResult = $state<string>('');
	let executionError = $state<string | null>(null);
	let selectedExample = $derived(
		esempiScheme.find((example) => example.id === selectedExampleId) ?? null
	);

	$effect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const queryCode = params.get('code');
			if (queryCode) {
				code = queryCode;
				selectedExampleId = '';
				runScheme();
			}
		}
	});

	function isError(error: unknown): error is Error {
		return error instanceof Error;
	}

	function resetExecutionState() {
		executionError = null;
		executionTimeline = [];
		currentStepIndex = 0;
		finalResult = '';
	}

	function loadSelectedExample() {
		if (!selectedExample) {
			return;
		}

		code = selectedExample.sorgente;
		resetExecutionState();
	}

	function runScheme() {
		resetExecutionState();

		try {
			const stepper = StepperScheme.daSorgente(code);
			const formatter = new FormatterScheme();
			const steps = stepper.passiDaSorgente(code);
			const timeline = formatter.formattaTimelineStepping(steps);
			const finalSnapshot = timeline[timeline.length - 1];

			executionTimeline = timeline;
			finalResult = finalSnapshot ? finalSnapshot.successivo : '';
		} catch (error: unknown) {
			executionError = isError(error) ? error.message : 'Errore di esecuzione sconosciuto';
		}
	}
</script>

<div class="page">
	<header class="toolbar">
		<div class="controls-group">
			<button class="run-btn" onclick={runScheme}>
				<span class="btn-icon">▶</span> Esegui Scheme
			</button>

			<label class="control">
				<span class="control-label">Esempio:</span>
				<select bind:value={selectedExampleId} onchange={loadSelectedExample}>
					<option value="">Carica un esempio...</option>
					{#each esempiScheme as example (example.id)}
						<option value={example.id}>{example.titolo}</option>
					{/each}
				</select>
			</label>

			<label class="control">
				<span class="control-label">Orientamento:</span>
				<select bind:value={direction}>
					<option value="horizontal">Orizzontale</option>
					<option value="vertical">Verticale</option>
				</select>
			</label>

			<label class="control">
				<span class="control-label">Pannello Destra:</span>
				<select bind:value={rightMode}>
					<option value="stepper">Stepper / Traccia</option>
					<option value="output">Output Finale</option>
				</select>
			</label>

			<a href="/help" class="help-link" title="Consulta la guida e le FAQ di Scheme">
				<span>📚</span> Guida & FAQ
			</a>
		</div>

		{#if selectedExample}
			<section class="example-summary" aria-live="polite">
				<h2>{selectedExample.titolo}</h2>
				<p>{selectedExample.descrizione}</p>
			</section>
		{/if}
	</header>

	<main class="workspace">
		<SplitPane {direction} initialSplit={50}>
			{#snippet first()}
				<div class="pane-wrapper">
					<div class="pane-title">
						<span>Editor Little Scheme</span>
						<span class="pane-badge">S-Expression</span>
					</div>
					<CodeMirror bind:doc={code} />
				</div>
			{/snippet}

			{#snippet second()}
				<div class="pane-wrapper">
					{#if executionError}
						<div class="error-box" role="alert">
							<div class="error-title">⚠️ Errore di Esecuzione</div>
							<pre class="error-message">{executionError}</pre>
							<div class="error-actions">
								<a href="/help#ambienti-e-struttura" class="error-help-link">
									Consulta la guida alla risoluzione errori ➔
								</a>
							</div>
						</div>
					{:else if rightMode === 'stepper'}
						<StepperView
							timeline={executionTimeline}
							{currentStepIndex}
							onStepChange={(idx) => (currentStepIndex = idx)}
						/>
					{:else}
						<div class="output-wrapper">
							<div class="pane-title">
								<span>Risultato Finale Evaluation</span>
								{#if finalResult}
									<span class="result-badge">OK</span>
								{/if}
							</div>
							<div class="output-content">
								{#if finalResult}
									<pre><code>{finalResult}</code></pre>
								{:else}
									<div class="empty-state">
										Premi <strong>▶ Esegui Scheme</strong> per visualizzare il risultato finale.
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</SplitPane>
	</main>
</div>

<style>
	.page {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 49px);
		overflow: hidden;
	}

	.toolbar {
		background: #182238;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid #283548;
		flex-shrink: 0;
	}

	.controls-group {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.85rem;
		font-size: 0.85rem;
	}

	.control {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #cbd5e1;
	}

	.control-label {
		font-size: 0.8rem;
		font-weight: 500;
		color: #94a3b8;
	}

	.run-btn {
		background: #10b981;
		color: #042f2e;
		font-weight: bold;
		border: none;
		padding: 0.4rem 0.95rem;
		border-radius: 6px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.85rem;
		transition: all 0.15s ease;
	}

	.run-btn:hover {
		background: #34d399;
		box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
	}

	.btn-icon {
		font-size: 0.75rem;
	}

	select {
		background: #0f172a;
		color: #f8fafc;
		border: 1px solid #334155;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		font-family: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		outline: none;
	}

	select:focus {
		border-color: #38bdf8;
	}

	.help-link {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: #38bdf8;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.85rem;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		border: 1px solid #1e3a5f;
		background: #0d1b2e;
		transition: all 0.15s ease;
	}

	.help-link:hover {
		background: #1d3356;
		color: #ffffff;
		border-color: #38bdf8;
	}

	.example-summary {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding-top: 0.4rem;
		border-top: 1px solid #283548;
	}

	.example-summary h2 {
		margin: 0;
		font-size: 0.95rem;
		color: #e2e8f0;
	}

	.example-summary p {
		margin: 0;
		color: #94a3b8;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.workspace {
		flex: 1;
		min-height: 0;
		position: relative;
	}

	.pane-wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #090d16;
	}

	.pane-title {
		background: #182238;
		padding: 6px 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		border-bottom: 1px solid #283548;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.pane-badge {
		font-size: 0.7rem;
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.1);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.result-badge {
		font-size: 0.7rem;
		color: #10b981;
		background: rgba(16, 185, 129, 0.15);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.error-box {
		padding: 1.5rem;
		background: #2a0c0c;
		color: #fca5a5;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
	}

	.error-title {
		font-size: 1rem;
		font-weight: bold;
		color: #f87171;
	}

	.error-message {
		font-family: monospace;
		white-space: pre-wrap;
		background: #1c0505;
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid #5c1d1d;
		margin: 0;
	}

	.error-actions {
		margin-top: 0.5rem;
	}

	.error-help-link {
		color: #38bdf8;
		font-size: 0.85rem;
		text-decoration: underline;
	}

	.output-wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.output-content {
		padding: 1.25rem;
		flex: 1;
		overflow-y: auto;
	}

	.output-content pre {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.95rem;
		color: #34d399;
		background: #0f172a;
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid #1e293b;
		white-space: pre-wrap;
	}

	.empty-state {
		color: #64748b;
		text-align: center;
		margin-top: 3rem;
		font-size: 0.9rem;
	}
</style>
