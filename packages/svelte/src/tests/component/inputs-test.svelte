<script lang="ts">
	const dProps: {
		value1?: string;
		value2?: number;
	} = $props();
</script>

<div class="inputs-test">{dProps.value1}{dProps.value2}</div>
