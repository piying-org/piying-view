<script setup lang="ts">
import { useControlValueAccessor } from '@piying/view-vue2-legacy';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
</script>

<template>
  <input type="text" v-model="value" v-bind:disabled="disabled" @blur="touchedChange" />
</template>
