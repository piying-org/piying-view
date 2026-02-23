<script lang="ts">
	import * as v from 'valibot';
	import { convert } from '@piying/view-core';
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
	import {
		InjectorToken,
		PI_INPUT_MODEL_TOKEN,
		PI_INPUT_OPTIONS_TOKEN,
		PI_INPUT_SCHEMA_TOKEN,
		PI_VIEW_FIELD_TOKEN
	} from '../token';
	import { SvelteSchemaHandle } from '../svelte-schema';
	import { SvelteFormBuilder } from '../builder';
	import FieldTemplate from './field-template.svelte';
	import { initListen } from '@piying/view-core';
	let inputs: {
		schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
		model?: any;
		modelChange?: (value: any) => void;
		options: { injector?: Injector; builder?: any; [name: string]: any };
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

	setContext(InjectorToken, () => rootInjector);
	setContext(PI_INPUT_OPTIONS_TOKEN, () => inputs.options);
	setContext(PI_INPUT_SCHEMA_TOKEN, () => inputs.schema);
	setContext(PI_INPUT_MODEL_TOKEN, () => inputs.model);
	let injectorDispose: (() => any) | undefined;

	const [field, subInjector] = $derived.by(() => {
		injectorDispose?.();
		const subInjector = createInjector({ providers: [], parent: rootInjector });
		injectorDispose = () => {
			subInjector.destroy();
			injectorDispose = undefined;
		};
		const field = convert(inputs.schema as any, {
			...inputs.options,
			handle: SvelteSchemaHandle as any,
			builder: SvelteFormBuilder,
			injector: subInjector
		});
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
