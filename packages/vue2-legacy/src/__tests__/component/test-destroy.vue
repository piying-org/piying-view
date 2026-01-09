<script lang="ts">
import { markRaw, watchEffect } from 'vue';
import * as v from 'valibot';
import CInput from './input.vue';
import { PiyingView } from '@piying/view-vue2-legacy';
import { getField } from '../util/actions';
import type { PiResolvedViewFieldConfig } from '@piying/view-vue2-legacy';
const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

const schema = v.pipe(v.string(), getField(field$));
const options = {
  fieldGlobalConfig: {
    types: {
      string: { type: markRaw(CInput) },
    },
  },
};

export default {
  props: {
    open: { type: Boolean },
  },
  watch: {
    open: function (value: any) {
      if (value) {
        field$.promise.then((field) => {
          this.$emit('getField', field);
        });
      }
    },
  },
};
</script>

<template>
  <template v-if="props.open">
    <div class="wrapper">
      <piying-view :schema="schema" :options="options"></piying-view>
    </div>
  </template>
</template>
