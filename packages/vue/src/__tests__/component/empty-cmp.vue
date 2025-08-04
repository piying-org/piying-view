<script setup lang="ts">
const props = defineProps<{ input1?: string }>();
</script>

<template>
  <div class="empty-cmp">{{ props.input1 ?? '' }}</div>
</template>
