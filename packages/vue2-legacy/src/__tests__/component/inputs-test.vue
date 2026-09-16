<script setup lang="ts">
const inputs = defineProps<{
  value1?: string;
  value2?: number;
}>();
</script>

<template>
  <div class="inputs-test">{{ inputs.value1 }}{{ inputs.value2 }}</div>
</template>
