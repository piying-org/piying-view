<script setup lang="ts">
import { InjectorToken } from '@piying/view-vue2-legacy';
import { inject } from 'vue';
import { Test1Token } from '../util/token';

const emit = defineEmits(['tokenChange']);
emit('tokenChange', {
  value: inject(InjectorToken)!.value.get(Test1Token),
});
</script>

<template>
  <div></div>
</template>
