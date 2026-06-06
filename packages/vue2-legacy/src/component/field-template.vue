<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onUnmounted,
  provide,
  shallowRef,
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
  type KeyPath,
} from '@piying/view-core';
import { Fragment } from 'vue-fragment';

const props = defineProps<{
  field: PiResolvedViewFieldConfig;
  path?: KeyPath;
}>();

const field = computed(() => {
  const keyPath = props.path;
  return keyPath ? props.field.get(keyPath)! : props.field;
});
const injector = vInject(InjectorToken)!;

const renderConfig = signalToRef(() => field.value.renderConfig());
const inputs = signalToRef(() => field.value.inputs?.());
const attributes = signalToRef(() => field.value.attributes?.());
const fieldInput = computed(() => ({ ...attributes.value, ...inputs.value }));
const outputs = signalToRef(() => field.value.outputs?.());
const events = signalToRef(() => field.value.events?.());
const fieldOutput = computed(() => ({ ...outputs.value, ...events.value }));

const fieldChildren = signalToRef(() => field.value.children?.());

const wrappers = signalToRef(() => field.value.wrappers());
const define = signalToRef(() => field.value.define?.());
const componentType = computed(() =>
  typeof define.value?.type === 'function' || isLazyMark(define.value?.type)
    ? defineAsyncComponent(getLazyImport<any>(define.value?.type))
    : define.value?.type,
);
provide(PI_VIEW_FIELD_TOKEN, field);
// 使用cva
const childRef = shallowRef<any>(null);
const isControl = isFieldControl(field.value.form.control);
let dispose: ((destroy?: boolean) => void) | undefined;

watch(
  [childRef, field, injector],
  ([childRef, field, injector]) => {
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
            <component :is="componentType" v-bind="fieldInput" v-on="fieldOutput"></component>
          </template>
          <!-- control -->
          <template v-else>
            <template v-if="field.form.control">
              <component
                :is="componentType"
                v-bind="fieldInput"
                v-on="fieldOutput"
                ref="childRef"
              ></component>
            </template>
            <template v-else>
              <component :is="componentType" v-bind="fieldInput" v-on="fieldOutput"></component>
            </template>
          </template>
        </pi-wrapper>
      </template>
    </template>
  </Fragment>
</template>

<style scoped></style>
