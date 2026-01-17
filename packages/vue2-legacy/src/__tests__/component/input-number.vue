<script setup lang="ts">
import { useControlValueAccessor } from '@piying/view-vue2-legacy';
// import { vModelText } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor(false);
defineExpose({ cva });
const valueChange2 = (event: Event) => {
  valueChange((event.target as HTMLInputElement).valueAsNumber);
};
</script>

<template>
  <input
    type="number"
    v-model="value"
    @input="valueChange2"
    v-bind:disabled="disabled"
    @blur="touchedChange"
  />
</template>
