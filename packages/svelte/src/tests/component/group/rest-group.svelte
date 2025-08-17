<script lang="ts">
	import {
		type PiResolvedViewFieldConfig,
		PI_VIEW_FIELD_TOKEN,
		PiyingFieldTemplate,
		signalToRef
	} from '@piying/view-svelte';
	import { getContext } from 'svelte';

	const field = getContext<() => PiResolvedViewFieldConfig>(PI_VIEW_FIELD_TOKEN);
	const fixedChildren = signalToRef(() => field()?.fixedChildren!());
	const restChildren = signalToRef(() => field()?.restChildren!());
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
