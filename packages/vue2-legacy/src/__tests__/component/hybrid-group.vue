<script setup lang="ts">
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN } from '../../index';
import { Field, PiyingFieldTemplate } from '@piying/view-vue2-legacy';

const field = inject(PI_VIEW_FIELD_TOKEN)!;
const child = field.value.get(['k2'])!;
</script>

<template>
  <div>
    <Field :field="field" :path="['k1']" v-slot="{ cvaa }">
      <div class="mode1-wrapper">
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
    <PiyingFieldTemplate :field="field" :path="['k2']"> </PiyingFieldTemplate>
  </div>
</template>

<style scoped></style>
