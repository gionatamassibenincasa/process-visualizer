<!-- file: src/lib/components/QandA.svelte -->
<script lang="ts">
	import type { DomandaRisposta, EsempioFAQ } from '#lib/data/faq/types';

	export type Esempio = EsempioFAQ;
	export type DomandaRispostaProps = DomandaRisposta;

	interface Props {
		id?: string;
		domanda: string;
		risposta: string;
		ebnf?: string;
		esempio?: EsempioFAQ[] | EsempioFAQ;
		tag?: string[];
		isOpenDefault?: boolean;
	}

	let { id, domanda, risposta, ebnf, esempio, tag = [], isOpenDefault = true }: Props = $props();

	let localOpen = $state<boolean | null>(null);
	let isOpen = $derived(localOpen !== null ? localOpen : isOpenDefault);
	let copiedIndex = $state<number | null>(null);
	let copiedEbnf = $state(false);

	let listaEsempi = $derived<EsempioFAQ[]>(
		esempio ? (Array.isArray(esempio) ? esempio : [esempio]) : []
	);

	async function copyToClipboard(text: string, isEbnf = false, index = 0) {
		try {
			await navigator.clipboard.writeText(text);
			if (isEbnf) {
				copiedEbnf = true;
				setTimeout(() => {
					copiedEbnf = false;
				}, 2000);
			} else {
				copiedIndex = index;
				setTimeout(() => {
					copiedIndex = null;
				}, 2000);
			}
		} catch {
			// Fallback silently if clipboard is unavailable
		}
	}
</script>

<article class="qanda-card" {id}>
	<header class="qanda-header">
		<button
			type="button"
			class="toggle-btn"
			aria-expanded={isOpen}
			onclick={() => (localOpen = !isOpen)}
		>
			<span class="chevron" class:expanded={isOpen} aria-hidden="true">▶</span>
			<h3 class="domanda-title">{domanda}</h3>
		</button>

		{#if tag.length > 0}
			<div class="tags-list">
				{#each tag as t (t)}
					<span class="tag-badge">#{t}</span>
				{/each}
			</div>
		{/if}
	</header>

	{#if isOpen}
		<div class="qanda-body">
			<section class="risposta-section">
				<p class="risposta-text">{risposta}</p>
			</section>

			{#if ebnf}
				<section class="ebnf-section">
					<div class="section-header">
						<span class="badge badge-ebnf">EBNF</span>
						<button
							type="button"
							class="action-btn copy-btn"
							onclick={() => copyToClipboard(ebnf, true)}
							title="Copia regola EBNF"
						>
							{copiedEbnf ? '✓ Copiato' : 'Copia EBNF'}
						</button>
					</div>
					<pre class="ebnf-code"><code>{ebnf}</code></pre>
				</section>
			{/if}

			{#if listaEsempi.length > 0}
				<section class="esempi-section">
					{#each listaEsempi as item, idx (item.titolo + idx)}
						<div class="esempio-box">
							<div class="section-header">
								<h4 class="esempio-titolo">{item.titolo}</h4>
								{#if item.tipo === 'codice'}
									<div class="actions">
										<button
											type="button"
											class="action-btn copy-btn"
											onclick={() => copyToClipboard(item.contenuto, false, idx)}
											title="Copia codice"
										>
											{copiedIndex === idx ? '✓ Copiato' : 'Copia'}
										</button>
										<a
											class="action-btn try-btn"
											href="/?code={encodeURIComponent(item.contenuto)}"
											title="Prova questo codice nel visualizzatore"
										>
											▶ Prova nell'Editor
										</a>
									</div>
								{/if}
							</div>

							{#if item.tipo === 'codice'}
								<pre class="scheme-code"><code lang="scheme">{item.contenuto}</code></pre>
							{:else}
								<p class="esempio-testo">{item.contenuto}</p>
							{/if}
						</div>
					{/each}
				</section>
			{/if}
		</div>
	{/if}
</article>

<style>
	.qanda-card {
		background: #131b2e;
		border: 1px solid #283548;
		border-radius: 8px;
		margin-bottom: 1.25rem;
		overflow: hidden;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.qanda-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
	}

	.qanda-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		background: #182238;
		border-bottom: 1px solid #283548;
	}

	.toggle-btn {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		background: none;
		border: none;
		padding: 0;
		color: #f1f5f9;
		text-align: left;
		cursor: pointer;
		width: 100%;
		font-family: inherit;
	}

	.toggle-btn:focus-visible {
		outline: 2px solid #38bdf8;
		outline-offset: 4px;
		border-radius: 4px;
	}

	.chevron {
		display: inline-block;
		font-size: 0.75rem;
		color: #38bdf8;
		transition: transform 0.2s ease;
		margin-top: 0.25rem;
		flex-shrink: 0;
	}

	.chevron.expanded {
		transform: rotate(90deg);
	}

	.domanda-title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.45;
		color: #f8fafc;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-left: 1.5rem;
	}

	.tag-badge {
		font-size: 0.7rem;
		font-family: monospace;
		background: #0f172a;
		color: #94a3b8;
		padding: 0.15rem 0.45rem;
		border-radius: 9999px;
		border: 1px solid #334155;
	}

	.qanda-body {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.risposta-text {
		margin: 0;
		color: #cbd5e1;
		font-size: 0.95rem;
		line-height: 1.6;
		white-space: pre-line;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	.badge-ebnf {
		background: #1e1b4b;
		color: #a5b4fc;
		border: 1px solid #4338ca;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.action-btn {
		font-size: 0.75rem;
		font-family: inherit;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		cursor: pointer;
		text-decoration: none;
		transition: all 0.15s ease;
		border: none;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.copy-btn {
		background: #202d42;
		color: #94a3b8;
		border: 1px solid #334155;
	}

	.copy-btn:hover {
		background: #334155;
		color: #f8fafc;
	}

	.try-btn {
		background: #065f46;
		color: #a7f3d0;
		border: 1px solid #059669;
	}

	.try-btn:hover {
		background: #047857;
		color: #ffffff;
	}

	.ebnf-section {
		background: #0b0f19;
		border: 1px solid #1e293b;
		border-radius: 6px;
		padding: 0.75rem 1rem;
	}

	.ebnf-code {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.85rem;
		color: #e0e7ff;
		overflow-x: auto;
		white-space: pre-wrap;
	}

	.esempi-section {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.esempio-box {
		background: #090d16;
		border: 1px solid #222f44;
		border-radius: 6px;
		padding: 0.75rem 1rem;
	}

	.esempio-titolo {
		margin: 0;
		font-size: 0.85rem;
		color: #38bdf8;
		font-weight: 600;
	}

	.scheme-code {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.85rem;
		color: #f1f5f9;
		overflow-x: auto;
		white-space: pre-wrap;
		line-height: 1.5;
	}

	.esempio-testo {
		margin: 0;
		color: #cbd5e1;
		font-size: 0.9rem;
	}
</style>
