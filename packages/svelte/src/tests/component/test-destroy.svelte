<script setup lang="ts">
import { markRaw, watchEffect } from 'vue';
import * as v from 'valibot';
import CInput from './input.vue';
import { PiyingView } from '../../index';
import { getField } from '../util/actions';
import type { PiResolvedViewFieldConfig } from '../../type/group';
const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

const dProps:{
  open: boolean;
 } = $props();
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
  if (dProps.open) {
    field$.promise.then((field) => {
      emit('getField', field);
    });
  }
});
</script>
{#if dProps.open}
    <div class="wrapper">
      <piying-view :schema="schema" :options="options"></piying-view>
    </div>
{/if}
