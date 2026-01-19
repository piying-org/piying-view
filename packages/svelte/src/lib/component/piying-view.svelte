<script lang="ts">
	import * as v from 'valibot';
	import { convert } from '@piying/view-core';
	import {
		ChangeDetectionScheduler,
		ChangeDetectionSchedulerImpl,
		createInjector,
		createRootInjector,
		DestroyRef,
		untracked,
		type EffectRef
	} from 'static-injector';
	import type { Injector } from 'static-injector';
	import { setContext } from 'svelte';
	import { InjectorToken } from '../token';
	import { SvelteSchemaHandle } from '../svelte-schema';
	import { SvelteFormBuilder } from '../builder';
	import FieldTemplate from './field-template.svelte';
	import { initListen } from '@piying/view-core';
	let props: {
		schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
		model?: any;
		modelChange?: (value: any) => void;
		options: any;
	} = $props();

	const rootInjector = createRootInjector({
		providers: [
			{
				provide: ChangeDetectionScheduler,
				useClass: ChangeDetectionSchedulerImpl
			}
		]
	});
	setContext(InjectorToken, rootInjector);
	let injectorDispose: (() => any) | undefined;

	const [field, subInjector] = $derived.by(() => {
		injectorDispose?.();
		const subInjector = createInjector({ providers: [], parent: rootInjector });
		injectorDispose = () => {
			subInjector.destroy();
			injectorDispose = undefined;
		};
		const field = convert(props.schema as any, {
			handle: SvelteSchemaHandle as any,
			builder: SvelteFormBuilder,
			injector: subInjector,
			...props.options
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
			ref = initListen(props.model, field!.form.control!, subInjector as Injector, (value) => {
				untracked(() => {
					if (field!.form.control?.valueNoError$$()) {
						props.modelChange?.(value);
					}
				});
			});
			field!.form.control?.updateValue(props.model);
		}

		return () => {
			ref?.destroy();
		};
	});
</script>

<FieldTemplate {field}></FieldTemplate>
