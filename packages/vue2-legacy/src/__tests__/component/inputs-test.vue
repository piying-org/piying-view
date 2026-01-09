<script setup lang="ts">
const inputs = defineProps<{
  value1?: any;
  value2?: any;
}>();
</script>

<template>
  <div class="inputs-test">{{ inputs.value1 }}{{ inputs.value2 }}</div>
</template>
