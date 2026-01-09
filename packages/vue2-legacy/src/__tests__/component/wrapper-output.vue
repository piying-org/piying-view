<script lang="ts">
export default {
  methods: {
    emit: function (key: any, value: any) {
      this.$emit(key, value);
    },
  },
};
</script>

<template>
  <button class="wrapper-btn" @click="emit('output1', '1')"></button>
  <div class="wrapper2">
    <slot></slot>
  </div>
</template>
