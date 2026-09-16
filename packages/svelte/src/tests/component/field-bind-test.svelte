<script lang="ts">
	import { Field } from '@piying/view-svelte';
	import type { Equal, IsAny } from '../util/type-assert';
	import type { TestField } from '../util/field-fixture';

	let props: { field: TestField } = $props();
</script>

<!-- text1: 期望 cvaa.value 是 string | undefined, field 不是 any -->
<Field field={props.field} path={['text1']}>
	{#snippet children(cvaa, f)}
		{@const valueIsString: Equal<typeof cvaa.value, string | undefined> = true}
		{@const fieldNotAny: false = true as IsAny<typeof f>}
		{@const changeArg: Equal<
			Parameters<typeof cvaa.valueChange>[0],
			string | undefined
		> = true}
		<input
			class="t-text"
			type="text"
			value={cvaa.value ?? ''}
			oninput={(e) => cvaa.valueChange(e.currentTarget.value)}
			onblur={cvaa.touchedChange}
		/>
		<span class="t-assert">{String(valueIsString && fieldNotAny && changeArg)}</span>
		<span class="t-out">{cvaa.value ?? '(empty)'}</span>
	{/snippet}
</Field>

<!-- number1: 期望 cvaa.value 是 number -->
<Field field={props.field} path={['number1']}>
	{#snippet children(cvaa)}
		{@const valueIsNumber: Equal<typeof cvaa.value, number> = true}
		<span class="t-num">{String(valueIsNumber)}</span>
	{/snippet}
</Field>
