<script lang="ts">
	import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
	import { Field } from '@piying/view-svelte';
	let { field }: { field: _PiResolvedCommonViewFieldConfig } = $props();
</script>

<Field {field}>
	{#snippet children(cvaa)}
		<div>
			<input
				class="mode1"
				type="text"
				bind:value={() => cvaa.value, (v) => cvaa.valueChange(v)}
				disabled={cvaa.disabled}
				onblur={() => cvaa.touchedChange()}
			/>
		</div>
	{/snippet}
</Field>
