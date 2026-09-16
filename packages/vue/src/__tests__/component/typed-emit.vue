<script setup lang="ts">
const props = defineProps<{
  name?: string;
  count?: number;
}>();

const emit = defineEmits<{
  (e: 'change', value: number): void;
  (e: 'submit'): void;
}>();
</script>

<template>
  <div class="typed-emit">
    <span class="name">{{ props.name }}</span>
    <span class="count">{{ props.count }}</span>
    <button class="btn-change" @click="emit('change', 42)"></button>
    <button class="btn-submit" @click="emit('submit')"></button>
  </div>
</template>
