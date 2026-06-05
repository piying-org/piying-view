<script setup lang="ts">
import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
import { Field } from '@piying/view-vue2-legacy';

const props = defineProps<{ field: _PiResolvedCommonViewFieldConfig }>();
</script>

<template>
  <Field :field="field" v-slot="{ cvaa }">
    <div>
      <input
        class="mode1"
        type="text"
        v-model="cvaa.value"
        @input="cvaa.valueChange($event.target.value)"
        v-bind:disabled="cvaa.disabled.value"
        @blur="cvaa.touchedChange"
      />
    </div>
  </Field>
</template>
