<script setup lang="ts">
import type { PiResolvedViewFieldConfig } from '../type/group';
import FieldTemplate from '../field-template.vue';

const dInputs = defineProps<{
  fields: PiResolvedViewFieldConfig[];
  restFields?: PiResolvedViewFieldConfig[];
}>();
</script>

<template>
  <template v-for="(field, index) in dInputs.fields" :key="index">
    <field-template :field="field!"></field-template>
  </template>
</template>

<style scoped></style>
