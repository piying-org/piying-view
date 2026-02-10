<script setup lang="ts">
import { PI_INPUT_OPTIONS_TOKEN } from '@piying/view-vue';
import { inject } from 'vue';
import * as v from 'valibot';
import { actions, NFCSchema, setComponent } from '@piying/view-core';
import InjectorTest2 from './injector-test2.vue';
import { PiyingView } from '@piying/view-vue';

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
const options = inject(PI_INPUT_OPTIONS_TOKEN);
</script>

<template>
  <div>
    <piying-view :schema="schema" :options="options"></piying-view>
  </div>
</template>
