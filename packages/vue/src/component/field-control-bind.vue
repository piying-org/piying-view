<script setup lang="ts" generic="S extends PiResolvedViewFieldConfig = PiResolvedViewFieldConfig, P extends KeyPath = []">
import { computed, onUnmounted, watch } from 'vue';
import type { KeyPath, PiFieldGet, PiFieldValueOf } from '@piying/view-core';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { useControlValueAccessor } from '../util/use-control-value-accessor';

const props = defineProps<{
  field: S;
  path?: [...P];
}>();

const resolvedField = computed(() => {
  const keyPath = props.path;
  return keyPath ? props.field.get(keyPath) : props.field;
});

let dispose: ((destroy?: boolean) => void) | undefined;
// cvaa 的值类型跟着 path 指向的字段走
const { cva, cvaa } = useControlValueAccessor<
  PiFieldValueOf<PiFieldGet<S, P>>
>();

watch(
  [resolvedField],
  ([field]) => {
    dispose?.();
    if (field?.form?.control) {
      const control = field.form.control;
      if (!control) {
        throw new Error(`📍 fieldControlBind:[${field.keyPath || ''}]->[${props.path || ''}]❗`);
      }
      if (!isFieldControl(control)) {
        throw new Error(`🏷️ fieldControl❗`);
      }
      dispose = createViewControlLink(() => control, cva, field.injector);
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
  <slot :cvaa="cvaa" :field="resolvedField"> </slot>
</template>

<style scoped></style>
