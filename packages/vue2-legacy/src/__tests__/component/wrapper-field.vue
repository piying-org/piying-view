<script lang="ts">
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-vue2-legacy';

export default {
  inject: {
    field: PI_VIEW_FIELD_TOKEN,
  },
  created() {
    this.$emit('emitField', this.field());
  },
};
</script>

<template>
  <div class="wrapper-field">
    <slot></slot>
  </div>
</template>

<style scoped></style>
