<script setup lang="ts">
import { useControlValueAccessor } from '@piying/view-vue2-legacy';
// import { vModelSelect } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
</script>

<template>
  <select v-model="value" v-bind:disabled="disabled" @blur="touchedChange">
    <option value="v1">value1</option>
    <option value="v2">value2</option>
  </select>
</template>
