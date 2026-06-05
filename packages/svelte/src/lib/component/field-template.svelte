<script lang="ts">
	import type { _PiResolvedCommonViewFieldConfig, KeyPath } from '@piying/view-core';
	import { signalToState } from '../util/signal-convert.svelte';
	import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '../token';
	import { createViewControlLink, getLazyImport, isLazyMark } from '@piying/view-core';
	import { getContext, setContext } from 'svelte';
	import type { Injector } from 'static-injector';
	import PiWrapper from './wrapper.svelte';
	const props: {
		field: _PiResolvedCommonViewFieldConfig;
		path?: KeyPath;
	} = $props();
	const injector = getContext<() => Injector>(InjectorToken)!;
	const field = $derived(props.path ? props.field.get(props.path)! : props.field);
	const fieldInputs = signalToState(() => {
		return {
			...field.attributes(),
			...field.inputs(),
			// todo outputs不应该加signal,因为没必要动态更新?
			...field.outputs()
		};
	});
	let controlRef = $state<any>();
	const renderConfig = signalToState(() => field.renderConfig());
	const control = $derived.by(() => field.form.control);
	$effect.pre(() => {
		let dispose: (() => any) | undefined;
		if (controlRef?.cva) {
			dispose = createViewControlLink((() => control) as any, controlRef?.cva, injector());
		}
		return () => {
			dispose?.();
			dispose = undefined;
		};
	});
	const fieldChildren = signalToState(() => field.children?.());

	const wrappers = signalToState(() => field.wrappers());
	const ComponentType = $derived.by(() => {
		return field.define?.()?.type;
	});
	const isLazy = $derived.by(() => {
		return isLazyMark(ComponentType);
	});
	const loading = $derived.by(() => {
		return getLazyImport<() => Promise<any>>(ComponentType)!();
	});
	setContext(PI_VIEW_FIELD_TOKEN, () => field);
</script>

{#if !renderConfig()?.hidden && ComponentType}
	{#snippet children()}
		{#if isLazy}
			{#await loading then LazyComponent}
				{#if fieldChildren()}
					<LazyComponent {...fieldInputs()}></LazyComponent>
				{:else if field.form.control}
					<LazyComponent {...fieldInputs()} bind:this={controlRef}></LazyComponent>
				{:else}
					<LazyComponent {...fieldInputs()}></LazyComponent>
				{/if}
			{/await}
		{:else if fieldChildren()}
			<ComponentType {...fieldInputs()}></ComponentType>
		{:else if field.form.control}
			<ComponentType {...fieldInputs()} bind:this={controlRef}></ComponentType>
		{:else}
			<ComponentType {...fieldInputs()}></ComponentType>
		{/if}
	{/snippet}
	<PiWrapper wrappers={wrappers()!} {children}></PiWrapper>
{/if}
