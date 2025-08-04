<script setup lang="ts">
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN } from '../../formly/token';
const field = inject(PI_VIEW_FIELD_TOKEN);
const emit = defineEmits(['emitField']);
emit('emitField', field);
</script>

<template>
  <div class="wrapper-field">
    <slot></slot>
  </div>
</template>

<style scoped></style>
