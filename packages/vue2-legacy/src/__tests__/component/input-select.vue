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
  <select
    v-model-select="value"
    :onUpdate:modelValue="valueChange"
    v-bind:disabled="disabled"
    @blur="touchedChange"
  >
    <option value="v1">value1</option>
    <option value="v2">value2</option>
  </select>
</template>
