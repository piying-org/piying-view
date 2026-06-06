<script lang="ts">
	import type { KeyPath } from '@piying/view-core';
	import { createViewControlLink, isFieldControl } from '@piying/view-core';
	import type { PiResolvedViewFieldConfig } from '../type/group';
	import { useControlValueAccessor } from '../util/use-control-value-accessor.svelte';

	let props: {
		field: PiResolvedViewFieldConfig;
		path?: KeyPath;
		children: (cvaa: any, field: PiResolvedViewFieldConfig) => any;
	} = $props();

	let dispose: ((destroy?: boolean) => void) | undefined;

	const resolvedField = $derived(props.path ? props.field.get(props.path)! : props.field);

	const { cva, cvaa } = useControlValueAccessor();
	$effect.pre(() => {
		dispose?.();
		const control = resolvedField?.form.control;
		if (!control) {
			throw new Error(
				`📍 fieldControlBind:[${props.field?.keyPath || ''}]->[${props.path || ''}]❗`
			);
		}
		if (!isFieldControl(control)) {
			throw new Error(`🏷️ fieldControl❗`);
		}
		dispose = createViewControlLink(() => control, cva, props.field.injector);
		return () => {
			dispose?.(true);
			dispose = undefined;
		};
	});
</script>

{@render props.children(cvaa, resolvedField)}
