<script setup lang="ts">
import {
  PI_INPUT_MODEL_TOKEN,
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
} from '@piying/view-vue';
import { inject } from 'vue';

const emit = defineEmits(['tokenChange']);
emit('tokenChange', {
  options: inject(PI_INPUT_OPTIONS_TOKEN),
  schema: inject(PI_INPUT_SCHEMA_TOKEN),
  model: inject(PI_INPUT_MODEL_TOKEN),
});
</script>

<template>
  <div></div>
</template>
