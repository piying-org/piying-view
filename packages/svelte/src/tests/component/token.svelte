<script lang="ts">
	import {
		PI_INPUT_MODEL_TOKEN,
		PI_INPUT_OPTIONS_TOKEN,
		PI_INPUT_SCHEMA_TOKEN
	} from '@piying/view-core';
	import { getContext } from 'svelte';
	import { PI_VIEW_FIELD_TOKEN } from '@piying/view-svelte';

	let dProps: { tokenChange: (input: any) => void } = $props();

	const field = getContext<PI_VIEW_FIELD_TOKEN>(PI_VIEW_FIELD_TOKEN);

	dProps.tokenChange({
		options: field().injector.get(PI_INPUT_OPTIONS_TOKEN),
		schema: field().injector.get(PI_INPUT_SCHEMA_TOKEN),
		model: field().injector.get(PI_INPUT_MODEL_TOKEN)
	});
</script>

<div class="wrapper-field"></div>
