<!-- file: src/routes/+layout.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Process Visualizer — Little Scheme Interpreter & Stepper</title>
	<meta
		name="description"
		content="Visualizzatore interattivo di processi di esecuzione e riduzione per programmi Scheme con supporto step-by-step e documentazione."
	/>
</svelte:head>

<div class="app-shell">
	<nav class="app-nav">
		<div class="nav-brand">
			<a href={resolve('/')} class="brand-link">
				<span class="lambda-logo">λ</span>
				<span class="brand-text">
					<strong>Process Visualizer</strong>
					<small class="brand-sub">Little Scheme</small>
				</span>
			</a>
		</div>

		<div class="nav-links">
			<a href={resolve('/')} class="nav-item" data-sveltekit-preload-data="hover">
				<span class="nav-icon">⚡</span>
				Visualizzatore
			</a>
			<a href={resolve('/help')} class="nav-item" data-sveltekit-preload-data="hover">
				<span class="nav-icon">📖</span>
				Guida & FAQ
			</a>
		</div>
	</nav>

	<div class="app-content">
		{@render children()}
	</div>
</div>

<style>
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background: #090d16;
		color: #f8fafc;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-nav {
		background: #0f172a;
		border-bottom: 1px solid #1e293b;
		padding: 0.5rem 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		z-index: 50;
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: #f8fafc;
	}

	.lambda-logo {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: linear-gradient(135deg, #2563eb, #06b6d4);
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: bold;
		font-family: serif;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.brand-text strong {
		font-size: 0.95rem;
		color: #f8fafc;
	}

	.brand-sub {
		font-size: 0.75rem;
		color: #38bdf8;
		font-family: monospace;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-item {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.85rem;
		border-radius: 6px;
		text-decoration: none;
		color: #94a3b8;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.15s ease;
		background: transparent;
		border: 1px solid transparent;
	}

	.nav-item:hover {
		color: #f8fafc;
		background: #1e293b;
		border-color: #334155;
	}

	.nav-icon {
		font-size: 0.9rem;
	}

	.app-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
</style>
