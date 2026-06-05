<script setup lang="ts">
import * as v from 'valibot';
import { type ConvertOptions, type PiResolvedCommonViewFieldConfig } from '@piying/view-core';
import { computed, inject, provide, shallowRef, watch } from 'vue';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createInjector,
  createRootInjector,
  untracked,
  type EffectRef,
} from 'static-injector';
import { InjectorToken, PI_VIEW_FIELD_TOKEN } from '../token';
import FieldTemplate from './field-template.vue';
import type { Injector, R3Injector } from 'static-injector';
import { initListen } from '@piying/view-core';
import { convertToField } from '../util/convert-wrapper.ts';
const inputs = defineProps<{
  schema: v.BaseSchema<any, any, any>;
  modelValue?: any;
  options: ConvertOptions;
}>();

const emit = defineEmits(['update:modelValue']);
const maybeParentField = inject(PI_VIEW_FIELD_TOKEN, undefined);
const rootInjector = computed(
  () =>
    inputs.options.injector ??
    maybeParentField?.value.injector ??
    createRootInjector({
      providers: [
        {
          provide: ChangeDetectionScheduler,
          useClass: ChangeDetectionSchedulerImpl,
        },
      ],
    }),
);
provide(InjectorToken, rootInjector);

const initResult =
  shallowRef<[Omit<PiResolvedCommonViewFieldConfig<any, any>, 'define'>, R3Injector]>();
watch(
  () => [inputs.schema, inputs.options, rootInjector.value],
  (_, __, onCleanup) => {
    const subInjector = createInjector({ providers: [], parent: rootInjector.value });
    onCleanup(() => {
      subInjector.destroy();
    });

    const field = convertToField(
      () => inputs.schema,
      subInjector,
      () => inputs.modelValue,
      () => inputs.options,
    );
    initResult.value = [field, subInjector] as const;
  },
  { immediate: true },
);

const field = computed(() => initResult.value![0]);
watch(
  () => [initResult.value!, inputs.modelValue],
  ([[field, subInjector], modelValue], _1, onWatcherCleanup) => {
    let ref: EffectRef | undefined;
    if (field.form.control) {
      ref = initListen(modelValue, field!.form.control!, subInjector as Injector, (value) => {
        untracked(() => {
          if (field!.form.control?.valueNoError$$()) {
            emit('update:modelValue', value);
          }
        });
      });
      field!.form.control!.updateValue(inputs.modelValue);
    }
    onWatcherCleanup(() => {
      ref?.destroy();
    });
  },
  { immediate: true },
);
</script>

<template>
  <field-template :field="field!"></field-template>
</template>

<style scoped></style>
