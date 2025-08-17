<script lang="ts">
	import { PiyingView } from '@piying/view-svelte';
	let { inputs, registerModel, registerSchema } = $props();
	let model = $state(inputs.model);
	let schema = $state(inputs.schema);
	registerModel((value: any) => {
		model = value;
	});
	registerSchema((value: any) => {
		schema = value;
	});
</script>

<PiyingView {...inputs} {model} {schema}></PiyingView>
