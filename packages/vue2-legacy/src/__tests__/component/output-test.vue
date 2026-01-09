<script lang="ts">
export default {
  methods: {
    emit1: function () {
      this.$emit('emit1', 'value1');
    },
    emit2: function () {
      this.$emit('emit2', 'value2');
    },
  },
};
</script>

<template>
  <button class="btn1" @click="emit1()"></button>
  <button class="btn2" @click="emit2()"></button>
</template>
