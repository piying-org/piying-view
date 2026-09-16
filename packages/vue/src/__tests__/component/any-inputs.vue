<script setup lang="ts">
// 故意写成 any: 用来对照「any prop 什么都收, 完全看不出类型来源」
const props = defineProps<{
  value1?: any;
  value2?: any;
}>();
</script>

<template>
  <div class="any-inputs">{{ props.value1 }}{{ props.value2 }}</div>
</template>
