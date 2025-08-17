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
	import { setContext, untrack } from 'svelte';
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
	const [field, subInjector] = $derived.by(() => {
		const subInjector = createInjector({ providers: [], parent: rootInjector });

		const field = convert(props.schema as any, {
			handle: SvelteSchemaHandle as any,
			builder: SvelteFormBuilder,
			injector: subInjector,
			registerOnDestroy: (fn) => {
				subInjector!.get(DestroyRef).onDestroy(() => {
					fn();
				});
			},
			...props.options
		});
		return [field, subInjector];
	});
	$effect.pre(() => {
		let ref: EffectRef | undefined;
		if (field.form.control) {
			const model = untrack(() => props.model);
			ref = initListen(
				typeof model !== 'undefined' ? model : undefined,
				field!.form.control!,
				subInjector as Injector,
				(value) => {
					untracked(() => {
						if (field!.form.control?.valueNoError$$()) {
							props.modelChange?.(value);
						}
					});
				}
			);
		}
		return () => {
			subInjector.destroy();
			ref?.destroy();
		};
	});

	$effect.pre(() => {
		field!.form.control?.updateValue(props.model);
	});
</script>

<FieldTemplate {field}></FieldTemplate>
