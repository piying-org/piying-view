<script lang="ts">
	import FieldTemplate from './field-template.svelte';
	import { getContext } from 'svelte';
	import type { PiResolvedViewFieldConfig } from '../type';
	import { PI_VIEW_FIELD_TOKEN } from '../token';
	import { signalToRef } from '../util/signal-convert.svelte';

	const field = getContext<() => PiResolvedViewFieldConfig>(PI_VIEW_FIELD_TOKEN);
	const children = signalToRef(() => field().children!())!;
</script>

{#each children as field, i (i)}
	<FieldTemplate {field}></FieldTemplate>
{/each}
