<script setup lang="ts">
import { useControlValueAccessor } from '../../index';
import { vModelCheckbox } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
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
