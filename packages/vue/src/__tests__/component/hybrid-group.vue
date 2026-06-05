<script setup lang="ts">
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN, signalToRef } from '../../index';
import { Field, PiyingFieldTemplate } from '@piying/view-vue';

const field = inject(PI_VIEW_FIELD_TOKEN)!;
</script>

<template>
  <Field :field="field" :path="['k1']" v-slot="{ cvaa }">
    <div class="mode1-wrapper">
      <input
        class="mode1"
        type="text"
        v-model="cvaa.value"
        :onUpdate:modelValue="cvaa.valueChange"
        v-bind:disabled="cvaa.disabled.value"
        @blur="cvaa.touchedChange"
      />
    </div>
  </Field>
  <PiyingFieldTemplate :field="field" :path="['k2']"> </PiyingFieldTemplate>
</template>

<style scoped></style>
