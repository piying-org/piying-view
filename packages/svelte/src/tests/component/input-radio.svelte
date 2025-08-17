<script lang="ts">
	import { useControlValueAccessor } from '@piying/view-svelte';

	const { cva, cvaa } = useControlValueAccessor();
	let obj = {
		get value() {
			return cvaa.value;
		},
		set value(v) {
			cvaa.valueChange(v);
		}
	};
	export { cva };
</script>

<input type="radio" value="v1" bind:group={obj.value} class="r1" onblur={cvaa.touchedChange} />
<input type="radio" value="v2" bind:group={obj.value} class="r2" onblur={cvaa.touchedChange} />
