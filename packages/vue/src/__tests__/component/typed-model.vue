<script setup lang="ts">
const model = defineModel<string>();
const title = defineModel<number>('title');
</script>

<template>
  <div class="typed-model">
    <span class="model">{{ model }}</span>
    <span class="title">{{ title }}</span>
  </div>
</template>
