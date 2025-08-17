<script lang="ts">
	import {
		type PiResolvedViewFieldConfig,
		PI_VIEW_FIELD_TOKEN,
		signalToState,
		PiyingFieldTemplate
	} from '@piying/view-svelte';
	import { getContext } from 'svelte';
	let dProps: { activateIndex: number } = $props();
	const field = getContext<() => PiResolvedViewFieldConfig>(PI_VIEW_FIELD_TOKEN);
	const children = signalToState(() => field().children!())!;
</script>

<PiyingFieldTemplate field={children()![dProps.activateIndex]}></PiyingFieldTemplate>
