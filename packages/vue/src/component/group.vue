<script setup lang="ts">
import FieldTemplate from '../field-template.vue';
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN } from '../token';
import { signalToRef } from '../util';

const field = inject(PI_VIEW_FIELD_TOKEN)!;
const children = signalToRef(() => field?.value.children!());
</script>

<template>
  <template v-for="(field, index) in children" :key="index">
    <field-template :field="field!"></field-template>
  </template>
</template>

<style scoped></style>
