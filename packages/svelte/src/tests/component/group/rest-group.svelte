<script lang="ts">
	import {
		type PiResolvedViewFieldConfig,
		PI_VIEW_FIELD_TOKEN,
		PiyingFieldTemplate,
		signalToState
	} from '@piying/view-svelte';
	import { getContext } from 'svelte';

	const field = getContext<() => PiResolvedViewFieldConfig>(PI_VIEW_FIELD_TOKEN);
	const fixedChildren = signalToState(() => field()?.fixedChildren!());
	const restChildren = signalToState(() => field()?.restChildren!());
</script>

<div class="fields">
	{#if fixedChildren()}
		{#each fixedChildren()! as field, i (i)}
			<PiyingFieldTemplate {field}></PiyingFieldTemplate>
		{/each}
	{/if}
</div>
<div class="rest-fields">
	{#if restChildren()}
		{#each restChildren()! as field, i (i)}
			<PiyingFieldTemplate {field}></PiyingFieldTemplate>
		{/each}
	{/if}
</div>
