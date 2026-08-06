<script lang="ts">
	import SplitPane from '#lib/components/SplitPane.svelte';
	import CodeMirror from '#lib/components/CodeMirror.svelte';
	import StepperView from '#lib/components/SchemeStepperView.svelte';
	import type { EsempioScheme } from '#lib/scheme/examples/catalog';
	import { FormatterScheme, type SnapshotPassoStepping } from '#lib/scheme/ast/formatter';
	import { StepperScheme } from '#lib/scheme/runtime/stepper';

	let { data } = $props();
	let esempiScheme = $derived<readonly EsempioScheme[]>(data?.esempi ?? []);

	// Codice Scheme iniziale
	//let code = $state(`(define add1 (lambda (n) (+ n 1)))\n(add1 (+ 10 20))`);
	let code = $state(
		`; ambiente: minimo-numeri-naturali\n  (definisci addizione\n  (lambda (n m)\n    (cond\n      ((zero? m) n)\n      (altrimenti (s (addizione n (p m)))))))\n\n(addizione 5 3)`
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
			// const environment = creaAmbienteGlobale();
			// const stepper = new StepperScheme(environment);
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
			<button class="run-btn" onclick={runScheme}>▶ Esegui Scheme</button>

			<label class="control">
				Esempio
				<select bind:value={selectedExampleId} onchange={loadSelectedExample}>
					<option value="">Carica un esempio...</option>
					{#each esempiScheme as example (example.id)}
						<option value={example.id}>{example.titolo}</option>
					{/each}
				</select>
			</label>

			<label class="control">
				Orientamento:
				<select bind:value={direction}>
					<option value="horizontal">Orizzontale</option>
					<option value="vertical">Verticale</option>
				</select>
			</label>

			<label class="control">
				Pannello Destra:
				<select bind:value={rightMode}>
					<option value="stepper">Stepper / Traccia</option>
					<option value="output">Output Finale</option>
				</select>
			</label>
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
					<div class="pane-title">Editor Little Scheme</div>
					<CodeMirror bind:doc={code} />
				</div>
			{/snippet}

			{#snippet second()}
				<div class="pane-wrapper">
					{#if executionError}
						<div class="error-box">
							<strong>Errore:</strong>
							{executionError}
						</div>
					{:else if rightMode === 'stepper'}
						<StepperView
							timeline={executionTimeline}
							{currentStepIndex}
							onStepChange={(idx) => (currentStepIndex = idx)}
						/>
					{:else}
						<div class="output-wrapper">
							<div class="pane-title">Risultato Finale Evaluation</div>
							<pre><code>{finalResult}</code></pre>
						</div>
					{/if}
				</div>
			{/snippet}
		</SplitPane>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #090d16;
		color: #f8fafc;
		font-family: system-ui, sans-serif;
	}

	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.toolbar {
		background: #1e293b;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #334155;
	}

	.controls-group {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.85rem;
	}

	.control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.run-btn {
		background: #10b981;
		color: #042f2e;
		font-weight: bold;
		border: none;
		padding: 0.35rem 0.9rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.run-btn:hover {
		background: #34d399;
	}

	select {
		background: #0f172a;
		color: #f8fafc;
		border: 1px solid #475569;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.example-summary {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-top: 0.25rem;
		border-top: 1px solid #334155;
	}

	.example-summary h2 {
		margin: 0;
		font-size: 1rem;
		color: #e2e8f0;
	}

	.example-summary p {
		margin: 0;
		color: #cbd5e1;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.workspace {
		flex: 1;
		min-height: 0;
	}

	.pane-wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.pane-title {
		background: #1e293b;
		padding: 4px 12px;
		font-size: 0.75rem;
		text-transform: uppercase;
		color: #94a3b8;
		border-bottom: 1px solid #334155;
	}

	.error-box {
		padding: 1rem;
		background: #450a0a;
		color: #fca5a5;
		height: 100%;
	}

	.output-wrapper {
		padding: 1rem;
		font-family: monospace;
	}
</style>
