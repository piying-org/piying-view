<script setup lang="ts">
import * as v from 'valibot';
import { convert } from '@piying/view-core';
import { provide, shallowRef, watch, watchEffect } from 'vue';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createInjector,
  createRootInjector,
  DestroyRef,
  untracked,
  type EffectRef,
} from 'static-injector';
import { VueSchemaHandle } from './vue-schema';
import { VueFormBuilder } from './builder';
import { InjectorToken } from './token';
import FieldTemplate from './field-template.vue';
import type { PiResolvedViewFieldConfig } from './type/group';
import { initListen } from './util/init-listen';
import type { Injector } from 'static-injector';
const inputs = defineProps<{
  schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
  modelValue?: any;
  options: any;
}>();

const emit = defineEmits(['update:modelValue']);
const rootInjector = createRootInjector({
  providers: [
    {
      provide: ChangeDetectionScheduler,
      useClass: ChangeDetectionSchedulerImpl,
    },
  ],
});
provide(InjectorToken, rootInjector);

const field = shallowRef<PiResolvedViewFieldConfig | undefined>(undefined);

watch(
  () => [inputs.schema, inputs.options],
  ([schema, options], _1, onWatcherCleanup) => {
    const subInjector = createInjector({ providers: [], parent: rootInjector });

    const result = convert(schema as any, {
      handle: VueSchemaHandle as any,
      builder: VueFormBuilder,
      injector: subInjector,
      registerOnDestroy: (fn) => {
        subInjector!.get(DestroyRef).onDestroy(() => {
          fn();
        });
      },
      ...options,
    });
    field.value = result;
    let ref: EffectRef | undefined;
    if (result.form.control) {
      const value = inputs.modelValue;
      ref = initListen(
        typeof value !== 'undefined' ? value : undefined,
        result!.form.control!,
        subInjector as Injector,
        (value) => {
          untracked(() => {
            if (result!.form.control?.valueNoError$$()) {
              emit('update:modelValue', value);
            }
          });
        },
      );
    }
    onWatcherCleanup(() => {
      subInjector.destroy();
      ref?.destroy();
    });
  },
  { immediate: true },
);
watchEffect(() => {
  field.value!.form.control?.updateValue(inputs.modelValue);
});
</script>

<template>
  <field-template :field="field!"></field-template>
</template>

<style scoped></style>
