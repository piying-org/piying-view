<script lang="ts">
	let dProps: { children: any; input1?: string } = $props();
</script>

<div class="wrapper1">
	{dProps.input1 ?? ''}
	{@render dProps.children()}
</div>
