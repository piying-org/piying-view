<script lang="ts">
	const dProps: {
		value1?: any;
		value2?: any;
	} = $props();
</script>

<div class="inputs-test">{dProps.value1}{dProps.value2}</div>
