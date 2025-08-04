<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onUnmounted,
  provide,
  ref,
  inject as vInject,
  watch,
} from 'vue';
import type { PiResolvedViewFieldConfig } from './type/group';
import { signalToRef } from './util/signal-convert';
import { PI_VIEW_FIELD_TOKEN, InjectorToken } from './token';
import PiWrapper from './wrapper.vue';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
const props = defineProps<{
  field: PiResolvedViewFieldConfig;
}>();
const injector = vInject(InjectorToken)!;

const inputs = signalToRef(() => props.field.inputs());
const outputs = signalToRef(() => props.field.outputs());
const renderConfig = signalToRef(() => props.field.renderConfig());

const attributes = signalToRef(() => props.field.attributes());
const fieldInput = computed(() => ({ ...attributes.value, ...inputs.value }));
const fieldGroup = signalToRef(() => props.field.fieldGroup?.());
const fieldArray = signalToRef(() => props.field.fieldArray?.());
const groupInput = computed(() => ({ ...fieldInput.value, fields: fieldGroup.value }));
const arrayInput = computed(() => ({ ...fieldInput.value, fields: fieldArray.value }));
const wrappers = signalToRef(() => props.field.wrappers());

const componentType = computed(() =>
  typeof props.field.define?.type === 'function'
    ? defineAsyncComponent(props.field.define?.type)
    : props.field.define?.type,
);
const field = computed(() => props.field);
provide(PI_VIEW_FIELD_TOKEN, field);
// 使用cva
const childRef = ref<any>(null);
const isControl = isFieldControl(field.value.form.control);
let dispose: (() => void) | undefined;

watch(
  [childRef, field],
  ([childRef, field]) => {
    dispose?.();
    if (isControl && childRef) {
      dispose = createViewControlLink((() => field.form.control) as any, childRef['cva'], injector);
    }
  },
  { immediate: true },
);
onUnmounted(() => {
  dispose?.();
  dispose = undefined;
});
</script>

<template>
  <template v-if="!renderConfig!.hidden">
    <template v-if="field.define?.type">
      <pi-wrapper v-bind:wrappers="wrappers!">
        <!-- group -->
        <template v-if="fieldGroup">
          <component :is="componentType" v-bind="groupInput" v-on="outputs"></component>
        </template>
        <!-- array -->
        <template v-else-if="fieldArray">
          <component :is="componentType" v-bind="arrayInput" v-on="outputs"></component>
        </template>
        <!-- control -->
        <template v-else>
          <template v-if="field.form.control">
            <component
              :is="componentType"
              v-bind="fieldInput"
              v-on="outputs"
              ref="childRef"
            ></component>
          </template>
          <template v-else>
            <component :is="componentType" v-bind="fieldInput" v-on="outputs"></component>
          </template>
        </template>
      </pi-wrapper>
    </template>
  </template>
</template>

<style scoped></style>
