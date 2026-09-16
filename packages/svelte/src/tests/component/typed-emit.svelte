<script lang="ts">
	const props: {
		name?: string;
		count?: number;
		onChange: (value: number) => void;
		onSubmit: () => void;
	} = $props();
</script>

<div class="typed-emit">
	<span class="name">{props.name}</span>
	<span class="count">{props.count}</span>
	<button class="btn-change" aria-label="change" onclick={() => props.onChange(42)}></button>
	<button class="btn-submit" aria-label="submit" onclick={() => props.onSubmit()}></button>
</div>
