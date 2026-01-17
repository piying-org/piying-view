<script setup lang="ts">
import FieldTemplate from './field-template.vue';
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN } from '../token';
import { signalToRef } from '../util';
import { Fragment } from 'vue-fragment';
const field = inject(PI_VIEW_FIELD_TOKEN)!;
const children = signalToRef(() => field?.value.children!());
</script>

<template>
  <Fragment>
    <template v-for="(field, index) in children">
      <!-- eslint-disable-next-line vue/no-v-for-template-key-on-child -->
      <field-template :field="field" :key="index"></field-template>
    </template>
  </Fragment>
</template>

<style scoped></style>
