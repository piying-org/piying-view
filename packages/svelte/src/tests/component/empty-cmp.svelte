<script lang="ts">
	const props: { input1?: string } = $props();
</script>

<div class="empty-cmp">{props.input1 ?? ''}</div>
