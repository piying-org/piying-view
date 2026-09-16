<script lang="ts">
	// 多参数 emit, 用来验证回调参数元组是否被原样保留
	const props: {
		onRange: (start: number, end: string) => void;
		onTag: (index: number, tag: string, ok: boolean) => void;
	} = $props();
</script>

<div class="typed-emit-multi">
	<button class="btn-range" aria-label="range" onclick={() => props.onRange(1, 'z')}></button>
	<button class="btn-tag" aria-label="tag" onclick={() => props.onTag(0, 'a', true)}></button>
</div>
