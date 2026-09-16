<script lang="ts">
	import type { TypedInputsMeta } from './typed-inputs-types';

	// 每个 input 都带真实值类型, 方便看出「类型到底从哪来」
	const props: {
		label: string;
		count: number;
		enabled?: boolean;
		tags?: string[];
		meta?: TypedInputsMeta;
	} = $props();
</script>

<div class="typed-inputs">
	<span class="label">{props.label}</span>
	<span class="count">{props.count}</span>
	<span class="enabled">{String(props.enabled)}</span>
	<span class="tags">{(props.tags ?? []).join(',')}</span>
	<span class="meta">{props.meta ? `${props.meta.id}:${props.meta.name}` : ''}</span>
</div>
