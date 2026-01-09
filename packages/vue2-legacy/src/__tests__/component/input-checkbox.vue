<script lang="ts">
// import { useControlValueAccessor } from '@piying/view-vue2-legacy';
// const {
//   cva,
//   cvaa: { value, valueChange, disabled, touchedChange },
// } = useControlValueAccessor();
// defineExpose({ cva });
export default {
  data: () => {
    return {
      cva: null,
    };
  },
};
</script>

<template>
  <input
    type="checkbox"
    v-model-checkbox="value"
    :onUpdate:modelValue="valueChange"
    v-bind:disabled="disabled"
    @blur="touchedChange"
  />
</template>
