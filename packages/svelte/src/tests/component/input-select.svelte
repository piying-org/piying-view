<script lang="ts">
	import { useControlValueAccessor } from '@piying/view-svelte';

	const { cva, cvaa } = useControlValueAccessor();
	export { cva };
</script>

<select
	bind:value={() => cvaa.value, (v) => cvaa.valueChange(v)}
	disabled={cvaa.disabled}
	onblur={cvaa.touchedChange}
>
	<option value="v1" class="r1">value1</option>
	<option value="v2" class="r2">value2</option>
</select>
