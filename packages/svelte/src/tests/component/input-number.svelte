<script lang="ts">
	import { useControlValueAccessor } from '@piying/view-svelte';

	const { cva, cvaa } = useControlValueAccessor();
	export { cva };
</script>

	<input
		type="number"
		bind:value={() => cvaa.value, (v) => cvaa.valueChange(v)}
		disabled={cvaa.disabled}
		onblur={cvaa.touchedChange}
	/>
