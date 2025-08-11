<script setup lang="ts">
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN, signalToRef } from '../../../index';
import { PiyingFieldTemplate } from '../../../index';

const field = inject(PI_VIEW_FIELD_TOKEN);
const fixedChildren = signalToRef(() => field?.value.fixedChildren!());
const restChildren = signalToRef(() => field?.value.restChildren!());
</script>

<template>
  <div class="fields">
    <template v-for="(field, index) in fixedChildren" :key="index">
      <PiyingFieldTemplate :field="field!"></PiyingFieldTemplate>
    </template>
  </div>
  <div class="rest-fields">
    <template v-for="(field, index) in restChildren" :key="index">
      <PiyingFieldTemplate :field="field!"></PiyingFieldTemplate>
    </template>
  </div>
</template>

<style scoped></style>
