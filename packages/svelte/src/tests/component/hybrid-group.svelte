<script lang="ts">
	import { PI_VIEW_FIELD_TOKEN, PiyingFieldTemplate, Field } from '@piying/view-svelte';
	import { getContext } from 'svelte';

	const field = getContext<() => any>(PI_VIEW_FIELD_TOKEN)();
</script>

<div>
	<Field {field} path={['k1']}>
		{#snippet children(cvaa)}
			<div class="mode1-wrapper">
				<input
					class="mode1"
					type="text"
					bind:value={() => cvaa.value, (v) => cvaa.valueChange(v)}
					disabled={cvaa.disabled}
					onblur={cvaa.touchedChange}
				/>
			</div>
		{/snippet}
	</Field>
	<PiyingFieldTemplate {field} path={['k2']} />
</div>
