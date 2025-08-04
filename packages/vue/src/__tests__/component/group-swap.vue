<script setup lang="ts">
import { inject } from 'vue';
import {
  PI_VIEW_FIELD_TOKEN,
  type PiResolvedViewFieldConfig,
  signalToRef,
  PiyingFieldTemplate,
} from '../../index';
const dInputs = defineProps<{
  fields: PiResolvedViewFieldConfig[];
  activateIndex: number;
}>();
const field = inject(PI_VIEW_FIELD_TOKEN);
const list = signalToRef(() => field?.value.fieldGroup!());
</script>

<template>
  <piying-field-template :field="list[dInputs.activateIndex]"></piying-field-template>
</template>

<style scoped></style>
