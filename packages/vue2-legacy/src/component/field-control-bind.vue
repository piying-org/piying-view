<script setup lang="ts" generic="S extends { get: (...args: any[]) => any } = PiResolvedViewFieldConfig, P extends KeyPath = []">
import { computed, onUnmounted, watch } from 'vue';
import type { KeyPath, PiFieldBindPath, PiFieldGet, PiFieldValueOf } from '@piying/view-core';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { useControlValueAccessor } from '../util/use-control-value-accessor';

const props = defineProps<{
  field: S;
  path?: [...P]| PiFieldBindPath<S>;
}>();

const resolvedField = computed(() => {
  const keyPath = props.path;
  // 约束为弱类型(避开 Vue2 声明产出对自引用类型的爆炸), 故在此显式回到推导结果
  return (keyPath ? props.field.get(keyPath) : props.field) as unknown as
    | PiFieldGet<S, P>
    | undefined;
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
    const f = field as unknown as PiResolvedViewFieldConfig | undefined;
    if (f?.form?.control) {
      const control = f.form.control;
      if (!control) {
        throw new Error(`📍 fieldControlBind:[${f.keyPath || ''}]->[${props.path || ''}]❗`);
      }
      if (!isFieldControl(control)) {
        throw new Error(`🏷️ fieldControl❗`);
      }
      dispose = createViewControlLink(() => control, cva, f.injector);
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
