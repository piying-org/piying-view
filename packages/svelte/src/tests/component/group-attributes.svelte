<script lang="ts">
	const props: { input1?: string; class?: any } = $props();
</script>

<div class={'group-attr ' + props.class}>{props.input1 ?? ''}></div>
