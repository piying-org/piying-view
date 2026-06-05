<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import type { KeyPath } from '@piying/view-core';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { useControlValueAccessor } from '../util/use-control-value-accessor';

const props = defineProps<{
  field: PiResolvedViewFieldConfig;
  path?: KeyPath;
}>();

const resolvedField = computed(() => {
  const keyPath = props.path;
  return keyPath ? props.field.get(keyPath) : props.field;
});

let dispose: ((destroy?: boolean) => void) | undefined;
const { cva, cvaa } = useControlValueAccessor();

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
  <div>
    <slot :cvaa="cvaa" :field="resolvedField"></slot>
  </div>
</template>

<style scoped></style>
