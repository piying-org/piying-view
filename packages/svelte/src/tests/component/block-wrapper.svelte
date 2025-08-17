<script lang="ts">
	let dProps: { children: any } = $props();
</script>

<div>
	block
	{@render dProps.children()}
</div>
