<script setup lang="ts">
import { PiResolvedViewFieldConfig } from '../../../index';
import { PiyingFieldTemplate } from '../../../index';

const dInputs = defineProps<{
  fields: PiResolvedViewFieldConfig[];
  restFields?: PiResolvedViewFieldConfig[];
}>();
</script>

<template>
  <div class="fields">
    <template v-for="(field, index) in dInputs.fields" :key="index">
      <PiyingFieldTemplate :field="field!"></PiyingFieldTemplate>
    </template>
  </div>
  <div class="rest-fields">
    <template v-for="(field, index) in dInputs.restFields" :key="index">
      <PiyingFieldTemplate :field="field!"></PiyingFieldTemplate>
    </template>
  </div>
</template>

<style scoped></style>
