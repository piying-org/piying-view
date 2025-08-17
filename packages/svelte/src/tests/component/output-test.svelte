<script lang="ts">
	const emits = defineEmits(['emit1', 'emit2']);
	function emit1() {
		emits('emit1', 'value1');
	}
	function emit2() {
		emits('emit2', 'value2');
	}
</script>

<button class="btn1" onclick={emit1}>1</button>
<button class="btn2" onclick={emit2}>2</button>
