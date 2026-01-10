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
      <field-template :field="field"></field-template>
    </template>
  </Fragment>
</template>

<style scoped></style>
