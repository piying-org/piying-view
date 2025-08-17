<script lang="ts">
	import type { PiResolvedViewFieldConfig } from '../type/group';
	import { signalToRef } from '../util/signal-convert.svelte';
	import { PI_VIEW_FIELD_TOKEN, InjectorToken, CVA } from '../token';
	import { createViewControlLink, isFieldControl } from '@piying/view-core';
	import { getContext, setContext } from 'svelte';
	import type { Injector } from 'static-injector';
	import PiWrapper from './wrapper.svelte';
	const props: {
		field: PiResolvedViewFieldConfig;
	} = $props();
	const injector = getContext<Injector>(InjectorToken)!;
	const fieldInputs = signalToRef(() => {
		return {
			...props.field.attributes(),
			...props.field.inputs(),
			// todo outputs不应该加signal,因为没必要动态更新?
			...props.field.outputs()
		};
	});
	let controlRef = $state<any>();
	const renderConfig = signalToRef(() => props.field.renderConfig());
	const control = $derived.by(() => props.field.form.control);
	$effect.pre(() => {
		let dispose: (() => any) | undefined;
		if (controlRef?.cva) {
			dispose = createViewControlLink((() => control) as any, controlRef?.cva, injector);
		}
		return () => {
			dispose?.();
			dispose = undefined;
		};
	});
	const fieldChildren = signalToRef(() => props.field.children?.());

	const wrappers = signalToRef(() => props.field.wrappers());
	// todo lazy检查
	const ComponentType = $derived.by(() => props.field.define?.type);
	const field = $derived(props.field);
	setContext(PI_VIEW_FIELD_TOKEN, () => field);
</script>

{#if !renderConfig()?.hidden}
	{#if field.define?.type}
		{#snippet children()}
			{#if fieldChildren()}
				<ComponentType {...fieldInputs()}></ComponentType>
			{:else if field.form.control}
				<ComponentType {...fieldInputs()} bind:this={controlRef}></ComponentType>
			{:else}
				<ComponentType {...fieldInputs()}></ComponentType>
			{/if}
		{/snippet}
		<PiWrapper wrappers={wrappers()!} {children}></PiWrapper>
	{/if}
{/if}
