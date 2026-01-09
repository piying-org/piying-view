<script setup lang="ts">
import { markRaw, watchEffect } from 'vue';
import * as v from 'valibot';
import CInput from './custom-input.vue';
import { PiyingView } from '@piying/view-vue2-legacy';
import { getField } from '../util/actions';
import type { PiResolvedViewFieldConfig } from '@piying/view-vue2-legacy';
const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

const props = defineProps<{
  open: boolean;
}>();
const emit = defineEmits(['getField']);

const schema = v.pipe(v.string(), getField(field$));
const options = {
  fieldGlobalConfig: {
    types: {
      string: { type: markRaw(CInput) },
    },
  },
};

watchEffect(() => {
  if (props.open) {
    field$.promise.then((field) => {
      emit('getField', field);
    });
  }
});
</script>

<template>
  <template v-if="props.open">
    <div class="wrapper">
      <piying-view :schema="schema" :options="options"></piying-view>
    </div>
  </template>
</template>

<style scoped></style>
