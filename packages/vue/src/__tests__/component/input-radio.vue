<script setup lang="ts">
import { useControlValueAccessor } from '../../index';
import { vModelRadio } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
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
