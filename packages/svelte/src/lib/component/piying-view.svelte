<script lang="ts">
	import * as v from 'valibot';
	import type { FieldConvertViewOptions } from '@piying/view-core';
	import {
		ChangeDetectionScheduler,
		ChangeDetectionSchedulerImpl,
		createInjector,
		createRootInjector,
		untracked,
		type EffectRef
	} from 'static-injector';
	import type { Injector } from 'static-injector';
	import { getContext, setContext } from 'svelte';
	import { InjectorToken, PI_VIEW_FIELD_TOKEN } from '../token';
	import FieldTemplate from './field-template.svelte';
	import { initListen } from '@piying/view-core';
	import { convertToField } from '../util/convert-wrapper.svelte';
	let inputs: {
		schema: v.BaseSchema<any, any, any>;
		model?: any;
		modelChange?: (value: any) => void;
		options: FieldConvertViewOptions;
	} = $props();
	const maybeParentField = getContext<PI_VIEW_FIELD_TOKEN>(PI_VIEW_FIELD_TOKEN);
	const rootInjector = $derived.by(() => {
		return (
			inputs.options.injector ??
			maybeParentField?.().injector ??
			createRootInjector({
				providers: [
					{
						provide: ChangeDetectionScheduler,
						useClass: ChangeDetectionSchedulerImpl
					}
				]
			})
		);
	});

	setContext(InjectorToken, () => rootInjector!);

	let injectorDispose: (() => any) | undefined;

	const [field, subInjector] = $derived.by(() => {
		injectorDispose?.();
		const subInjector = createInjector({ providers: [], parent: rootInjector });
		injectorDispose = () => {
			subInjector.destroy();
			injectorDispose = undefined;
		};
		const field = convertToField(
			() => inputs.schema,
			subInjector,
			() => inputs.options
		);
		return [field, subInjector];
	});
	$effect.pre(() => {
		return () => {
			return injectorDispose?.();
		};
	});
	$effect.pre(() => {
		let ref: EffectRef | undefined;
		if (field.form.control) {
			ref = initListen(inputs.model, field!.form.control!, subInjector as Injector, (value) => {
				untracked(() => {
					if (field!.form.control?.valueNoError$$()) {
						inputs.modelChange?.(value);
					}
				});
			});
			field!.form.control?.updateValue(inputs.model);
		}

		return () => {
			ref?.destroy();
		};
	});
</script>

<FieldTemplate {field}></FieldTemplate>
