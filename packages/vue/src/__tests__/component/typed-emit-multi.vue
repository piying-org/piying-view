<script setup lang="ts">
// 多参数 emit, 用来验证回调参数元组是否被原样保留
const emit = defineEmits<{
  (e: 'range', start: number, end: string): void;
  (e: 'tag', index: number, tag: string, ok: boolean): void;
}>();
</script>

<template>
  <div class="typed-emit-multi">
    <button class="btn-range" @click="emit('range', 1, 'z')"></button>
    <button class="btn-tag" @click="emit('tag', 0, 'a', true)"></button>
  </div>
</template>
