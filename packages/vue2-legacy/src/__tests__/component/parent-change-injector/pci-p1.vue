<script setup lang="ts">
import { PI_INPUT_OPTIONS_TOKEN, PiyingView } from '@piying/view-vue2-legacy';
import { computed, inject } from 'vue';
import * as v from 'valibot';
import { actions, NFCSchema, setComponent } from '@piying/view-core';
import PciP2 from './pci-p2.vue';
const inputs = defineProps<{
  inputs: any;
}>();
const parentPyOptions$$ = inject(PI_INPUT_OPTIONS_TOKEN)!;

const options = {
  ...parentPyOptions$$.value,
  injector: undefined,
};

const schema$$ = computed(() =>
  v.pipe(NFCSchema, setComponent(PciP2), actions.inputs.patch(inputs.inputs ?? {})),
);
</script>
<template>
  <PiyingView :schema="schema$$" :options="options"></PiyingView>
</template>

<style></style>
