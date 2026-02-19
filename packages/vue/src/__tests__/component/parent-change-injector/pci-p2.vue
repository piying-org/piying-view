<script setup lang="ts">
import { actions, NFCSchema, setComponent } from '@piying/view-core';
import { PI_INPUT_OPTIONS_TOKEN, PiyingView } from '@piying/view-vue';
import { signal } from 'static-injector';
import * as v from 'valibot';
import { inject, watchEffect } from 'vue';
import PciP3 from './pci-p3.vue';
import { PciTestService } from './pci-test.service';

let inputs = defineProps<{ value: number }>();
let schema = v.pipe(
  NFCSchema,
  setComponent(PciP3),
  actions.inputs.patchAsync({
    value: (field) => {
      return field.context['item$']();
    },
  }),
  actions.hooks.merge({
    allFieldsResolved: (field) => {
      field.injector.get(PciTestService);
    },
  }),
);
const parentPyOptions$$ = inject(PI_INPUT_OPTIONS_TOKEN)!;

const itemInputs$ = signal(inputs.value);
const options = {
  ...parentPyOptions$$.value,
  context: {
    ...parentPyOptions$$.value.context,
    item$: itemInputs$,
  },
  injector: undefined,
};
watchEffect(() => {
  itemInputs$.set(inputs.value);
});
</script>

<template>
  <PiyingView :schema="schema" :options="options"></PiyingView>
</template>
