<script setup lang="ts">
import { useControlValueAccessor } from '@piying/view-vue2-legacy';
// import { vModelCheckbox } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
</script>

<template>
  <input
    type="checkbox"
    v-model="value"
    v-bind:disabled="disabled"
    @blur="touchedChange"
  />
</template>
