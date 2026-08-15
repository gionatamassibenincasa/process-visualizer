<!-- file: src/routes/help/+page.svelte -->
<script lang="ts">
	import QandA from '#lib/components/QandA.svelte';
	import type { SezioneFAQ } from '#lib/data/faq/types';

	interface Props {
		data: {
			sezioni: SezioneFAQ[];
			catalog: {
				title: string;
				subtitle: string;
			};
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state('');
	let selectedSectionId = $state<string>('all');
	let expandAll = $state(true);

	// Filtro reattivo avanzato per sezioni e testo
	let sezioniFiltrate = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		const sezioniTarget =
			selectedSectionId === 'all'
				? data.sezioni
				: data.sezioni.filter((s) => s.id === selectedSectionId);

		if (!query) {
			return sezioniTarget;
		}

		return sezioniTarget
			.map((sezione) => {
				const itemsFiltrati = sezione.items.filter((item) => {
					const inDomanda = item.domanda.toLowerCase().includes(query);
					const inRisposta = item.risposta.toLowerCase().includes(query);
					const inEbnf = item.ebnf ? item.ebnf.toLowerCase().includes(query) : false;
					const inTags = item.tag ? item.tag.some((t) => t.toLowerCase().includes(query)) : false;
					const inEsempi = Array.isArray(item.esempio)
						? item.esempio.some(
								(e) =>
									e.titolo.toLowerCase().includes(query) ||
									e.contenuto.toLowerCase().includes(query)
							)
						: item.esempio
							? item.esempio.titolo.toLowerCase().includes(query) ||
								item.esempio.contenuto.toLowerCase().includes(query)
							: false;

					return inDomanda || inRisposta || inEbnf || inTags || inEsempi;
				});

				return {
					...sezione,
					items: itemsFiltrati
				};
			})
			.filter((sezione) => sezione.items.length > 0);
	});

	let totaleDomandeVisibili = $derived(sezioniFiltrate.reduce((acc, s) => acc + s.items.length, 0));

	let totaleDomandeComplessive = $derived(data.sezioni.reduce((acc, s) => acc + s.items.length, 0));

	function resetFiltri() {
		searchQuery = '';
		selectedSectionId = 'all';
	}
</script>

<svelte:head>
	<title>Guida & FAQ Scheme — Process Visualizer</title>
	<meta
		name="description"
		content="Documentazione interattiva, sintassi EBNF, semantica operativa e catalogo FAQ completo per il linguaggio Scheme."
	/>
</svelte:head>

<div class="docs-container">
	<!-- Intestazione Principale -->
	<header class="docs-hero">
		<div class="hero-content">
			<div class="hero-badge">Little Scheme • Documentazione & Guida Interattiva</div>
			<h1 class="hero-title">{data.catalog.title}</h1>
			<p class="hero-subtitle">{data.catalog.subtitle}</p>
		</div>

		<!-- Toolbar di Ricerca e Filtri -->
		<div class="search-toolbar">
			<div class="search-input-wrapper">
				<span class="search-icon" aria-hidden="true">🔍</span>
				<input
					type="search"
					class="search-input"
					placeholder="Cerca domande, parole chiave, primitive, regole EBNF..."
					bind:value={searchQuery}
					aria-label="Cerca nella documentazione FAQ"
				/>
				{#if searchQuery}
					<button
						type="button"
						class="clear-search-btn"
						onclick={() => (searchQuery = '')}
						aria-label="Cancella ricerca"
					>
						✕
					</button>
				{/if}
			</div>

			<div class="filter-controls">
				<label class="section-select-label">
					<span class="filter-label">Sezione:</span>
					<select bind:value={selectedSectionId} class="section-select">
						<option value="all">Tutte le sezioni ({totaleDomandeComplessive})</option>
						{#each data.sezioni as s (s.id)}
							<option value={s.id}>{s.titolo} ({s.items.length})</option>
						{/each}
					</select>
				</label>

				<button
					type="button"
					class="toggle-all-btn"
					onclick={() => (expandAll = !expandAll)}
					title="Espandi o comprimi tutte le schede FAQ"
				>
					{expandAll ? '⊟ Comprimi tutto' : '⊞ Espandi tutto'}
				</button>
			</div>
		</div>

		<!-- Badge Navigazione Rapida Categorie -->
		<nav class="category-pills" aria-label="Filtro rapido categorie">
			<button
				type="button"
				class="pill-btn"
				class:active={selectedSectionId === 'all'}
				onclick={() => (selectedSectionId = 'all')}
			>
				Tutto <span class="pill-count">{totaleDomandeComplessive}</span>
			</button>
			{#each data.sezioni as s (s.id)}
				<button
					type="button"
					class="pill-btn"
					class:active={selectedSectionId === s.id}
					onclick={() => (selectedSectionId = s.id)}
				>
					{s.titolo}
					<span class="pill-count">{s.items.length}</span>
				</button>
			{/each}
		</nav>
	</header>

	<!-- Contenuto Principale con Sezioni -->
	<main class="docs-main">
		<div class="results-meta">
			<span>
				Visualizzazione di <strong>{totaleDomandeVisibili}</strong> su {totaleDomandeComplessive}
				argomenti
			</span>
			{#if searchQuery || selectedSectionId !== 'all'}
				<button type="button" class="reset-link" onclick={resetFiltri}> Azzera filtri </button>
			{/if}
		</div>

		{#if sezioniFiltrate.length === 0}
			<div class="empty-results">
				<div class="empty-icon">🔎</div>
				<h3>Nessun risultato trovato</h3>
				<p>
					Nessuna domanda o regola corrisponde alla ricerca "<strong>{searchQuery}</strong>".
				</p>
				<button type="button" class="action-reset-btn" onclick={resetFiltri}>
					Mostra tutti gli argomenti
				</button>
			</div>
		{:else}
			<div class="sections-list">
				{#each sezioniFiltrate as sezione (sezione.id)}
					<section class="faq-section" id={sezione.id}>
						<header class="section-banner">
							<div class="section-title-wrapper">
								<h2 class="section-title">{sezione.titolo}</h2>
								<span class="section-count">{sezione.items.length} domande</span>
							</div>
							<p class="section-description">{sezione.descrizione}</p>
						</header>

						<div class="section-items">
							{#each sezione.items as item (item.id)}
								<QandA
									id={item.id}
									domanda={item.domanda}
									risposta={item.risposta}
									ebnf={item.ebnf}
									esempio={item.esempio}
									tag={item.tag}
									isOpenDefault={expandAll}
								/>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	.docs-container {
		max-width: 1080px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		width: 100%;
		box-sizing: border-box;
	}

	.docs-hero {
		background: #0f172a;
		border: 1px solid #1e293b;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
	}

	.hero-badge {
		display: inline-block;
		background: rgba(56, 189, 248, 0.12);
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.3);
		padding: 0.3rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
	}

	.hero-title {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 800;
		color: #ffffff;
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		margin: 0 0 1.5rem;
		color: #94a3b8;
		font-size: 1.05rem;
		line-height: 1.5;
	}

	.search-toolbar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	@media (min-width: 768px) {
		.search-toolbar {
			flex-direction: row;
			align-items: center;
		}
	}

	.search-input-wrapper {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		font-size: 0.95rem;
		color: #64748b;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		background: #090d16;
		border: 1px solid #334155;
		color: #f8fafc;
		padding: 0.65rem 2.25rem 0.65rem 2.5rem;
		border-radius: 8px;
		font-size: 0.95rem;
		font-family: inherit;
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.search-input:focus {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
	}

	.clear-search-btn {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		color: #94a3b8;
		cursor: pointer;
		font-size: 0.85rem;
		padding: 0.25rem;
	}

	.filter-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.section-select-label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.filter-label {
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.section-select {
		background: #090d16;
		color: #f8fafc;
		border: 1px solid #334155;
		padding: 0.55rem 0.85rem;
		border-radius: 8px;
		font-size: 0.85rem;
		font-family: inherit;
		cursor: pointer;
		outline: none;
	}

	.section-select:focus {
		border-color: #38bdf8;
	}

	.toggle-all-btn {
		background: #1e293b;
		color: #cbd5e1;
		border: 1px solid #334155;
		padding: 0.55rem 0.85rem;
		border-radius: 8px;
		font-size: 0.85rem;
		font-family: inherit;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.toggle-all-btn:hover {
		background: #334155;
		color: #ffffff;
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #1e293b;
	}

	.pill-btn {
		background: #131b2e;
		color: #94a3b8;
		border: 1px solid #283548;
		padding: 0.35rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.8rem;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.15s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.pill-btn:hover {
		background: #1e293b;
		color: #f8fafc;
		border-color: #3b82f6;
	}

	.pill-btn.active {
		background: #2563eb;
		color: #ffffff;
		border-color: #3b82f6;
	}

	.pill-count {
		font-size: 0.7rem;
		background: rgba(0, 0, 0, 0.3);
		padding: 0.1rem 0.35rem;
		border-radius: 9999px;
	}

	.docs-main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.results-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
		color: #94a3b8;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #1e293b;
	}

	.reset-link {
		background: none;
		border: none;
		color: #38bdf8;
		text-decoration: underline;
		cursor: pointer;
		font-size: inherit;
		padding: 0;
	}

	.sections-list {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.faq-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		scroll-margin-top: 80px;
	}

	.section-banner {
		background: #101726;
		border: 1px solid #1e293b;
		border-left: 4px solid #38bdf8;
		border-radius: 8px;
		padding: 1rem 1.25rem;
	}

	.section-title-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.section-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #f8fafc;
	}

	.section-count {
		font-size: 0.75rem;
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.1);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	.section-description {
		margin: 0.4rem 0 0;
		color: #94a3b8;
		font-size: 0.9rem;
	}

	.section-items {
		display: flex;
		flex-direction: column;
	}

	.empty-results {
		text-align: center;
		padding: 4rem 1rem;
		background: #0f172a;
		border: 1px dashed #334155;
		border-radius: 12px;
	}

	.empty-icon {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
	}

	.empty-results h3 {
		margin: 0 0 0.5rem;
		color: #f8fafc;
		font-size: 1.25rem;
	}

	.empty-results p {
		margin: 0 0 1.5rem;
		color: #94a3b8;
		font-size: 0.95rem;
	}

	.action-reset-btn {
		background: #3b82f6;
		color: #ffffff;
		border: none;
		padding: 0.55rem 1.25rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.action-reset-btn:hover {
		background: #2563eb;
	}
</style>
