<script lang="ts">
	let dProps: { children: any; input1?: string; class?: string } = $props();
</script>

<div class={'wrapper1 ' + (dProps.class ?? '')}>
	{dProps.input1 ?? ''}
	{@render dProps.children()}
</div>
