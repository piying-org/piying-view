<script lang="ts">
	import { PI_VIEW_FIELD_TOKEN } from '@piying/view-svelte';
	import { getContext } from 'svelte';

	let dProps: { children: any; emitField: (input: any) => void } = $props();

	const field = getContext<PI_VIEW_FIELD_TOKEN>(PI_VIEW_FIELD_TOKEN);

	dProps.emitField(field);
</script>

	<div class="wrapper-field">
		{@render dProps.children()}
	</div>

