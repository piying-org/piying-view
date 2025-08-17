<script lang="ts">
	import type { CoreResolvedWrapperConfig } from '@piying/view-core';
	import { signalToState } from '../util/signal-convert.svelte';
	import PiWrapper from './wrapper.svelte';
	const dProps: {
		wrappers: CoreResolvedWrapperConfig[];
		children: any;
	} = $props();
	const restWrappers = $derived.by(() => dProps.wrappers!.slice(1));
	const wrapper = $derived.by(() => dProps.wrappers?.[0]);
	const inputs = signalToState(() => ({
		...wrapper?.inputs(),
		...wrapper?.attributes(),
		...wrapper?.outputs
	}));
</script>

{#if wrapper}
	{#snippet childWrapper()}
		<PiWrapper wrappers={restWrappers} children={dProps.children}></PiWrapper>
	{/snippet}
	<wrapper.type {...inputs()} children={childWrapper}></wrapper.type>
{:else}
	{@render dProps.children()}
{/if}
