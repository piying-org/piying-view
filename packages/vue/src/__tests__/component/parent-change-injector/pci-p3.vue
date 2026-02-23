<script setup lang="ts">
const inputs = defineProps<{ value: number }>();
</script>

<template>
  <div class="test1">{{ inputs.value }}</div>
</template>
