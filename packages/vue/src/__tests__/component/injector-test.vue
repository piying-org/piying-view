<script setup lang="ts">
import { inject } from 'vue';
import * as v from 'valibot';
import { actions, NFCSchema, PI_INPUT_OPTIONS_TOKEN, setComponent } from '@piying/view-core';
import InjectorTest2 from './injector-test2.vue';
import { PI_VIEW_FIELD_TOKEN, PiyingView } from '@piying/view-vue';

const emit = defineEmits(['tokenChange']);

const schema = v.pipe(
  NFCSchema,
  setComponent(InjectorTest2),
  actions.outputs.patch({
    tokenChange: (value) => {
      emit('tokenChange', value);
    },
  }),
);
const field = inject(PI_VIEW_FIELD_TOKEN)!;

const options = field.value.injector.get(PI_INPUT_OPTIONS_TOKEN);
</script>

<template>
  <div>
    <piying-view :schema="schema" :options="options()"></piying-view>
  </div>
</template>
