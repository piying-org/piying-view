<script setup lang="ts">
const emits = defineEmits(['emit1', 'emit2']);
function emit1() {
  emits('emit1', 'value1');
}
function emit2() {
  emits('emit2', 'value2');
}
</script>

<template>
  <div>
    <button class="btn1" @click="emit1()"></button>
    <button class="btn2" @click="emit2()"></button>
  </div>
</template>
