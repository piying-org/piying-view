<script lang="ts">
	let { emit1, emit2 } = $props();
	function emit1Fn() {
		emit1('value1');
	}
	function emit2Fn() {
		emit2('value2');
	}
</script>

<button class="btn1" onclick={emit1Fn}>1</button>
<button class="btn2" onclick={emit2Fn}>2</button>
