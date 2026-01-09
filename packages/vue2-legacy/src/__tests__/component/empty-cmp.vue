<script lang="ts">
export default {
  props: { input1: { type: String } },
};
</script>

<template>
  <div class="empty-cmp">{{ input1 ?? '' }}</div>
</template>
