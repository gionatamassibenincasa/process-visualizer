<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		direction?: 'horizontal' | 'vertical';
		first: Snippet;
		second: Snippet;
		initialSplit?: number; // In percentuale (0 - 100)
	}

	let { direction = 'horizontal', first, second, initialSplit = 50 }: Props = $props();

	// Stato reattivo espresso tramite Runes
	let splitPercentage = $derived(initialSplit);
	let isDragging = $state(false);
	let containerRef = $state<HTMLElement | null>(null);

	function startDragging(e: PointerEvent) {
		isDragging = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function stopDragging(e: PointerEvent) {
		if (isDragging) {
			isDragging = false;
			try {
				(e.target as HTMLElement).releasePointerCapture(e.pointerId);
			} catch {
				/* Ignora se già rilasciato */
			}
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || !containerRef) return;

		const rect = containerRef.getBoundingClientRect();
		let newPercentage: number;

		if (direction === 'horizontal') {
			const currentPos = e.clientX - rect.left;
			newPercentage = (currentPos / rect.width) * 100;
		} else {
			const currentPos = e.clientY - rect.top;
			newPercentage = (currentPos / rect.height) * 100;
		}

		// Clamp tra 0 e 100
		splitPercentage = Math.min(Math.max(newPercentage, 0), 100);
	}
</script>

<div
	bind:this={containerRef}
	class="split-container {direction}"
	role="presentation"
	onpointermove={handlePointerMove}
	onpointerup={stopDragging}
>
	<!-- Pannello 1 (Alto / Sinistra) -->
	<div
		class="pane"
		style={direction === 'horizontal' ? `width: ${splitPercentage}%` : `height: ${splitPercentage}%`}
	>
		{@render first()}
	</div>

	<!-- Separatore / Splitter -->
	<div
		class="divider"
		role="separator"
		aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
		aria-valuenow={Math.round(splitPercentage)}
		aria-valuemin={0}
		aria-valuemax={100}
		onpointerdown={startDragging}
	>
		<div class="handle"></div>
	</div>

	<!-- Pannello 2 (Basso / Destra) -->
	<div
		class="pane"
		style={direction === 'horizontal'
			? `width: ${100 - splitPercentage}%`
			: `height: ${100 - splitPercentage}%`}
	>
		{@render second()}
	</div>
</div>

<style>
	.split-container {
		display: flex;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		user-select: none;
	}

	.split-container.horizontal {
		flex-direction: row;
	}

	.split-container.vertical {
		flex-direction: column;
	}

	.pane {
		overflow: auto;
		position: relative;
	}

	.divider {
		background: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		transition: background-color 0.15s ease;
	}

	.horizontal > .divider {
		width: 8px;
		cursor: col-resize;
	}

	.vertical > .divider {
		height: 8px;
		cursor: row-resize;
	}

	.divider:hover,
	.divider:active {
		background: #3b82f6;
	}

	.handle {
		background: #94a3b8;
		border-radius: 2px;
	}

	.horizontal > .divider .handle {
		width: 2px;
		height: 24px;
	}

	.vertical > .divider .handle {
		width: 24px;
		height: 2px;
	}
</style>