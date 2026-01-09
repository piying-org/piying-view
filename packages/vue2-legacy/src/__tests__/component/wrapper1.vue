<script lang="ts">
export default {
  props: {
    input: { type: String },
  },
};
</script>

<template>
  <div class="wrapper1">
    {{ input1 ?? '' }}
    <slot></slot>
  </div>
</template>

