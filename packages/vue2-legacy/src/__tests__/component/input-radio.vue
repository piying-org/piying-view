<script setup lang="ts">
import { useControlValueAccessor } from '@piying/view-vue2-legacy';
// import { vModelRadio } from 'vue';
const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();
defineExpose({ cva });
</script>

<template>
  <div>
    <input type="radio" value="v1" v-model="value" class="r1" @blur="touchedChange" />
    <input type="radio" value="v2" v-model="value" class="r2" @blur="touchedChange" />
  </div>
</template>
