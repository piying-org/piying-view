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
import type { PiResolvedViewFieldConfig } from '../type/group';
import { signalToRef } from '../util/signal-convert';
import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '../token';
import PiWrapper from './wrapper.vue';
import {
  createViewControlLink,
  getLazyImport,
  isFieldControl,
  isLazyMark,
} from '@piying/view-core';
import { Fragment } from "vue-fragment";

const props = defineProps<{
  field: PiResolvedViewFieldConfig;
}>();
const injector = vInject(InjectorToken)!;

const inputs = signalToRef(() => props.field.inputs());
const outputs = signalToRef(() => props.field.outputs());
const renderConfig = signalToRef(() => props.field.renderConfig());

const attributes = signalToRef(() => props.field.attributes());
const fieldInput = computed(() => ({ ...attributes.value, ...inputs.value }));
const fieldChildren = signalToRef(() => props.field.children?.());

const wrappers = signalToRef(() => props.field.wrappers());
const define = signalToRef(() => props.field.define?.());
const componentType = computed(() =>
  typeof define.value?.type === 'function' || isLazyMark(define.value?.type)
    ? defineAsyncComponent(getLazyImport<any>(define.value?.type))
    : define.value?.type,
);
const field = computed(() => props.field);
provide(PI_VIEW_FIELD_TOKEN, field);
// 使用cva
const childRef = ref<any>(null);
const isControl = isFieldControl(field.value.form.control);
let dispose: ((destroy?: boolean) => void) | undefined;

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
  dispose?.(true);
  dispose = undefined;
});
</script>

<template>
  <Fragment>
    <template v-if="!renderConfig.hidden">
      <template v-if="define?.type">
        <pi-wrapper v-bind:wrappers="wrappers">
          <!-- group -->
          <template v-if="fieldChildren">
            <component :is="componentType" v-bind="fieldInput" v-on="outputs"></component>
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
  </Fragment>
</template>

<style scoped></style>
