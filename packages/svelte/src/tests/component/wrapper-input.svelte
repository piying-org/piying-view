<script lang="ts">
	let dProps: { children: any } = $props();
</script>

<div class="wrapper2">
	{@render dProps.children()}
</div>
