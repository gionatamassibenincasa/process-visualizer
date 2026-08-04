<script lang="ts">
	import type { SnapshotPassoStepping } from '#lib/scheme/ast/formatter';

	interface Props {
		timeline: SnapshotPassoStepping[];
		currentStepIndex: number;
		onStepChange: (index: number) => void;
	}

	let { timeline, currentStepIndex, onStepChange }: Props = $props();

	let currentSnapshot = $derived(timeline[currentStepIndex] ?? null);
	let currentStatus = $derived.by(() => {
		if (!currentSnapshot) {
			return '—';
		}

		if (currentSnapshot.terminato) {
			return 'Terminato';
		}

		return currentSnapshot.haRidotto ? 'Riduzione' : 'Nessuna riduzione';
	});

	function goToStep(index: number) {
		if (timeline.length === 0) {
			return;
		}

		const boundedIndex = Math.max(0, Math.min(index, timeline.length - 1));
		onStepChange(boundedIndex);
	}
</script>

<div class="stepper-container">
	{#if timeline.length === 0}
		<div class="empty">Nessuna esecuzione attiva. Scrivi del codice Scheme e premi "Esegui".</div>
	{:else if currentSnapshot}
		<div class="controls">
			<button onclick={() => goToStep(0)} disabled={currentStepIndex === 0}>⏮ Inizio</button>
			<button onclick={() => goToStep(currentStepIndex - 1)} disabled={currentStepIndex === 0}>
				◀ Prev
			</button>
			<span class="step-indicator">
				Passo <strong>{currentStepIndex + 1}</strong> / {timeline.length}
			</span>
			<button
				onclick={() => goToStep(currentStepIndex + 1)}
				disabled={currentStepIndex >= timeline.length - 1}
			>
				Next ▶
			</button>
			<button
				onclick={() => goToStep(timeline.length - 1)}
				disabled={currentStepIndex >= timeline.length - 1}
			>
				Fine ⏭
			</button>
		</div>

		<div class="step-details">
			<div class="card">
				<h3>Regola Applicata</h3>
				<p class="description">{currentSnapshot.regola}</p>
			</div>

			<div class="card">
				<h3>Stato Precedente</h3>
				<div class="code-block">
					<pre><code>{currentSnapshot.precedente}</code></pre>
				</div>
			</div>

			<div class="card">
				<h3>Stato Successivo</h3>
				<div class="code-block result">
					<pre><code>{currentSnapshot.successivo}</code></pre>
				</div>
			</div>

			<div class="card">
				<h3>Metadati</h3>
				<div class="metadata-grid">
					<div class="metadata-item">
						<span class="label">Stato passo</span>
						<strong>{currentStatus}</strong>
					</div>
					<div class="metadata-item">
						<span class="label">Terminato</span>
						<strong>{currentSnapshot.terminato ? 'Sì' : 'No'}</strong>
					</div>
					<div class="metadata-item">
						<span class="label">Ha ridotto</span>
						<strong>{currentSnapshot.haRidotto ? 'Sì' : 'No'}</strong>
					</div>
					<div class="metadata-item metadata-item-wide">
						<span class="label">Focus programma</span>
						<strong>
							{#if currentSnapshot.focusProgramma}
								Forma {currentSnapshot.focusProgramma.indiceForma} /
								{currentSnapshot.focusProgramma.totaleForme}
							{:else}
								—
							{/if}
						</strong>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.stepper-container {
		padding: 1rem;
		height: 100%;
		box-sizing: border-box;
		overflow-y: auto;
		background: #0f172a;
		color: #e2e8f0;
		font-family: ui-sans-serif, system-ui, sans-serif;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #1e293b;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	button {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 0.4rem 0.8rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
	}

	button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.step-indicator {
		margin: 0 auto;
		font-size: 0.9rem;
	}

	.step-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card {
		background: #1e293b;
		border: 1px solid #334155;
		border-radius: 8px;
		padding: 1rem;
	}

	h3 {
		margin-top: 0;
		font-size: 0.9rem;
		text-transform: uppercase;
		color: #94a3b8;
		letter-spacing: 0.05em;
	}

	.description {
		color: #38bdf8;
		font-weight: 500;
	}

	.code-block {
		background: #090d16;
		padding: 0.5rem;
		border-radius: 4px;
		margin-top: 0.5rem;
		overflow-x: auto;
	}

	.code-block.result {
		border-left: 3px solid #10b981;
	}

	.label {
		font-size: 0.75rem;
		color: #64748b;
		display: block;
	}

	pre {
		margin: 0.25rem 0 0 0;
		font-family: monospace;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.empty {
		color: #64748b;
		text-align: center;
		margin-top: 2rem;
	}

	.metadata-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.metadata-item {
		background: #090d16;
		border: 1px solid #334155;
		border-radius: 6px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.metadata-item-wide {
		grid-column: 1 / -1;
	}
</style>