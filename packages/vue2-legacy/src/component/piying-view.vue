<script setup lang="ts">
import * as v from 'valibot';
import { convert, PiResolvedCommonViewFieldConfig } from '@piying/view-core';
import { computed, inject, provide, shallowRef, watch } from 'vue';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createInjector,
  createRootInjector,
  untracked,
  type EffectRef,
} from 'static-injector';
import { VueSchemaHandle } from '../vue-schema';
import { VueFormBuilder } from '../builder';
import {
  InjectorToken,
  PI_INPUT_MODEL_TOKEN,
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
  PI_VIEW_FIELD_TOKEN,
} from '../token';
import FieldTemplate from './field-template.vue';
import type { Injector, R3Injector } from 'static-injector';
import { initListen } from '@piying/view-core';
const inputs = defineProps<{
  schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
  modelValue?: any;
  options: { injector?: Injector; [name: string]: any };
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
provide(
  PI_INPUT_OPTIONS_TOKEN,
  computed(() => inputs.options as any),
);
provide(
  PI_INPUT_SCHEMA_TOKEN,
  computed(() => inputs.schema),
);
provide(
  PI_INPUT_MODEL_TOKEN,
  computed(() => inputs.modelValue),
);

const initResult =
  shallowRef<[Omit<PiResolvedCommonViewFieldConfig<any, any>, 'define'>, R3Injector]>();
watch(
  () => [inputs.schema, inputs.options, rootInjector.value],
  (_, __, onCleanup) => {
    const subInjector = createInjector({ providers: [], parent: rootInjector.value });
    onCleanup(() => {
      subInjector.destroy();
    });

    const field = convert(inputs.schema as any, {
      ...inputs.options,
      handle: VueSchemaHandle as any,
      builder: VueFormBuilder,
      injector: subInjector,
    });
    initResult.value = [field, subInjector] as const;
  },
  { immediate: true },
);
const field = computed(() => initResult.value![0]);

watch(
  () => [initResult.value!, inputs.modelValue] as const,
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
  <field-template :field="field"></field-template>
</template>

<style scoped></style>
