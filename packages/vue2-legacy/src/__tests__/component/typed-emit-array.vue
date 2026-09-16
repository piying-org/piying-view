<script setup lang="ts">
const props = defineProps<{
  label?: string;
}>();

const emit = defineEmits(['ping', 'pong']);
</script>

<template>
  <div class="typed-emit-array">
    <span class="label">{{ props.label }}</span>
    <button class="btn-ping" @click="emit('ping', 'pong!')"></button>
  </div>
</template>
