<script lang="ts">
	import {
		PI_INPUT_MODEL_TOKEN,
		PI_INPUT_OPTIONS_TOKEN,
		PI_INPUT_SCHEMA_TOKEN
	} from '@piying/view-svelte';
	import { getContext } from 'svelte';

	let dProps: { tokenChange: (input: any) => void } = $props();

	dProps.tokenChange({
		options: getContext<PI_INPUT_OPTIONS_TOKEN>(PI_INPUT_OPTIONS_TOKEN),
		schema: getContext<PI_INPUT_SCHEMA_TOKEN>(PI_INPUT_SCHEMA_TOKEN),
		model: getContext<PI_INPUT_MODEL_TOKEN>(PI_INPUT_MODEL_TOKEN)
	});
</script>

<div class="wrapper-field"></div>
