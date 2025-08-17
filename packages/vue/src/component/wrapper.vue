<script setup lang="ts">
import { computed } from 'vue';
import SelfComponent from './wrapper.vue';
import type { CoreResolvedWrapperConfig } from '@piying/view-core';
import { signalToRef } from '../util/signal-convert';

const dInputs = defineProps<{
  wrappers: CoreResolvedWrapperConfig[];
}>();
const restWrappers = computed(() => dInputs.wrappers!.slice(1));
const wrapper = computed(() => dInputs.wrappers[0]);
const inputs = signalToRef(() => ({ ...wrapper.value?.inputs(), ...wrapper.value?.attributes() }));
const outputs = computed(() => wrapper.value?.outputs ?? {});
</script>

<template>
  <template v-if="wrapper">
    <component :is="wrapper.type" v-bind="inputs" v-on="outputs">
      <self-component v-bind="{ wrappers: restWrappers }">
        <slot></slot>
      </self-component>
    </component>
  </template>
  <template v-else>
    <slot></slot>
  </template>
</template>

<style scoped></style>
