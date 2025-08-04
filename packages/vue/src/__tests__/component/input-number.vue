<script setup lang="ts">
import { useControlValueAccessor } from '../../index';
import { vModelText } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
</script>

<template>
  <input
    type="number"
    v-model-text="value"
    :onUpdate:modelValue="valueChange"
    v-bind:disabled="disabled"
    @blur="touchedChange"
  />
</template>
