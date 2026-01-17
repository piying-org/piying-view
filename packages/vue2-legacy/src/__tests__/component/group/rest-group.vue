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
      <template v-for="(field, index) in fixedChildren">
        <!-- eslint-disable-next-line vue/no-v-for-template-key-on-child -->
        <PiyingFieldTemplate :field="field" :key="index"></PiyingFieldTemplate>
      </template>
    </div>
    <div class="rest-fields">
      <template v-for="(field, index) in restChildren">
        <!-- eslint-disable-next-line vue/no-v-for-template-key-on-child -->
        <PiyingFieldTemplate :field="field" :key="index"></PiyingFieldTemplate>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
