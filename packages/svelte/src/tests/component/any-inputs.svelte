<script lang="ts">
	// 故意写成 any: 用来对照「any prop 什么都收, 完全看不出类型来源」
	const props: {
		value1?: any;
		value2?: any;
	} = $props();
</script>

<div class="any-inputs">{props.value1}{props.value2}</div>
