<script setup lang="ts">
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN, signalToRef, PiyingFieldTemplate } from '../../index';
const dInputs = defineProps<{
  activateIndex: number;
}>();
const field = inject(PI_VIEW_FIELD_TOKEN);
const children = signalToRef(() => field?.value.children!());
</script>

<template>
  <piying-field-template :field="children[dInputs.activateIndex]"></piying-field-template>
</template>

<style scoped></style>
