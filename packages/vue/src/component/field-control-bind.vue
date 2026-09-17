<script setup lang="ts" generic="S extends PiResolvedViewFieldConfig = PiResolvedViewFieldConfig, P extends KeyPath = []">
import { computed, onUnmounted, watch } from 'vue';
import type { KeyPath, PiFieldBindPath, PiFieldGet, PiFieldValueOf } from '@piying/view-core';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { useControlValueAccessor } from '../util/use-control-value-accessor';

const props = defineProps<{
  field: S;
  path?: [...P] | PiFieldBindPath<S>;
}>();

const resolvedField = computed(() => {
  const keyPath = props.path;
  // 显式收敛为推导结果, 避免 `[...P]` 直接传入 get() 时声明产出递归爆炸;
  // path 的期望类型带了字面量联合(为了补全), 传进 get() 前同样先收敛成 KeyPath
  return (keyPath ? props.field.get(keyPath as KeyPath) : props.field) as unknown as
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
