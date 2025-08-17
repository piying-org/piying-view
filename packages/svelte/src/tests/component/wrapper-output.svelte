<script lang="ts">
	let dProps: { children: any; output1: (input: any) => void } = $props();
</script>

<button class="wrapper-btn" onclick={() => dProps.output1('1')}>1</button>
<div class="wrapper2">
	{@render dProps.children()}
</div>
