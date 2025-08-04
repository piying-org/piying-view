<script setup lang="ts">
const emit = defineEmits(['output1']);
</script>

<template>
  <button class="wrapper-btn" @click="emit('output1', '1')"></button>
  <div class="wrapper2">
    <slot></slot>
  </div>
</template>

<style scoped></style>
