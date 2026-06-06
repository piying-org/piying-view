<script setup lang="ts">
import { PI_VIEW_FIELD_TOKEN, PiyingView } from '@piying/view-vue';
import { computed, inject } from 'vue';
import * as v from 'valibot';
import { actions, NFCSchema, PI_INPUT_OPTIONS_TOKEN, setComponent } from '@piying/view-core';
import PciP2 from './pci-p2.vue';
const inputs = defineProps<{
  inputs: any;
}>();
const field = inject(PI_VIEW_FIELD_TOKEN)!;
const parentPyOptions$$ = field.value.injector.get(PI_INPUT_OPTIONS_TOKEN)!;

const options = {
  ...parentPyOptions$$(),
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
