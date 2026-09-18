<script lang="ts" generics="S extends PiResolvedViewFieldConfig = PiResolvedViewFieldConfig, P extends KeyPath = []">
	import type { KeyPath, PiFieldBindPath } from '@piying/view-core';
	import { createViewControlLink, isFieldControl } from '@piying/view-core';
	import type { PiResolvedViewFieldConfig } from '../type/group';
	import type { FieldControlBindScope } from '../util/field-control-bind-scope';
	import { useControlValueAccessor } from '../util/use-control-value-accessor.svelte';

	let props: {
		field: S;
		path?: [...P] | PiFieldBindPath<S>;
		children: (
			cvaa: FieldControlBindScope<S, P>['cvaa'],
			field: FieldControlBindScope<S, P>['field']
		) => any;
	} = $props();

	let dispose: ((destroy?: boolean) => void) | undefined;

	// path 的期望类型带了字面量联合(为了补全), 传进 get() 前先收敛成 KeyPath
	const resolvedField = $derived(
		props.path ? props.field.get(props.path)! : props.field
	);

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

{@render props.children(cvaa as never, resolvedField as never)}
