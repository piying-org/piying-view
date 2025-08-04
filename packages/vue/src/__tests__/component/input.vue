<script setup lang="ts">
import { useControlValueAccessor } from '../../index';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
</script>

<template>
  <input
    type="text"
    v-model="value"
    :onUpdate:modelValue="valueChange"
    v-bind:disabled="disabled"
    @blur="touchedChange"
  />
</template>
