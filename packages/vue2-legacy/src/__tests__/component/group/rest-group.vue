<script setup lang="ts">
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN, signalToRef } from '@piying/view-vue2-legacy';
import { PiyingFieldTemplate } from '@piying/view-vue2-legacy';

const field = inject(PI_VIEW_FIELD_TOKEN);
const fixedChildren = signalToRef(() => field?.value.fixedChildren!());
const restChildren = signalToRef(() => field?.value.restChildren!());
</script>

<template>
  <div>
    <div class="fields">
      <template v-for="(field, index) in fixedChildren" >
        <PiyingFieldTemplate :field="field" :key="index"></PiyingFieldTemplate>
      </template>
    </div>
    <div class="rest-fields">
      <template v-for="(field, index) in restChildren" >
        <PiyingFieldTemplate :field="field" :key="index"></PiyingFieldTemplate>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
