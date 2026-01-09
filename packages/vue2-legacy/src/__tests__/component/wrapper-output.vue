<script setup lang="ts">
const emit = defineEmits(['output1']);
</script>

<template>
  <div>
    <button class="wrapper-btn" @click="emit('output1', '1')"></button>
    <div class="wrapper2">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped></style>
