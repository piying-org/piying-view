<script setup lang="ts">
import { actions, NFCSchema, PI_INPUT_OPTIONS_TOKEN, setComponent } from '@piying/view-core';
import { PiyingView, PI_VIEW_FIELD_TOKEN } from '@piying/view-vue2-legacy';
import { signal } from 'static-injector';
import * as v from 'valibot';
import { inject, watchEffect } from 'vue';
import PciP3 from './pci-p3.vue';
import { PciTestService } from './pci-test.service';

const inputs = defineProps<{ value: number }>();
const schema = v.pipe(
  NFCSchema,
  setComponent(PciP3),
  actions.inputs.patchAsync({
    value: (field) => field.context['item$'](),
  }),
  actions.hooks.merge({
    allFieldsResolved: (field) => {
      field.injector.get(PciTestService);
    },
  }),
);
const field = inject(PI_VIEW_FIELD_TOKEN)!;

const parentPyOptions$$ = field.value.injector.get(PI_INPUT_OPTIONS_TOKEN)!;

const itemInputs$ = signal(inputs.value);
const options = {
  ...parentPyOptions$$(),
  context: {
    ...parentPyOptions$$().context,
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
