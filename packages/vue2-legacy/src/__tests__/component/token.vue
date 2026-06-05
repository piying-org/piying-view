<script setup lang="ts">
import { PI_INPUT_OPTIONS_TOKEN, PI_INPUT_SCHEMA_TOKEN } from '@piying/view-core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-vue2-legacy';
import { inject } from 'vue';

const emit = defineEmits(['tokenChange']);
const field = inject(PI_VIEW_FIELD_TOKEN)!;
emit('tokenChange', {
  options: field.value.injector.get(PI_INPUT_OPTIONS_TOKEN),
  schema: field.value.injector.get(PI_INPUT_SCHEMA_TOKEN),
});
</script>

<template>
  <div></div>
</template>
