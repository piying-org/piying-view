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
    type="radio"
    value="v1"
    v-model-radio="value"
    :onUpdate:modelValue="valueChange"
    class="r1"
    @blur="touchedChange"
  />
  <input
    type="radio"
    value="v2"
    v-model-radio="value"
    :onUpdate:modelValue="valueChange"
    class="r2"
    @blur="touchedChange"
  />
</template>
