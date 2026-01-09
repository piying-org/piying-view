<script setup lang="ts">
const props = defineProps<{ input1?: string }>();
</script>

<template>
  <div class="wrapper1">
    {{ props.input1 ?? '' }}
    <slot></slot>
  </div>
</template>

<style scoped></style>
