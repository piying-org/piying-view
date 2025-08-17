<script lang="ts">
	import { useControlValueAccessor } from '@piying/view-svelte';

	const { cva, cvaa } = useControlValueAccessor();
	export { cva };
</script>

<input
	type="checkbox"
	bind:checked={
		() => {
			return cvaa.value as boolean;
		},
		(v) => {
			return cvaa.valueChange(v);
		}
	}
	disabled={cvaa.disabled}
	onblur={cvaa.touchedChange}
/>
