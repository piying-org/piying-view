<script lang="ts">
import { PI_VIEW_FIELD_TOKEN, SignalToDataFactory } from '../../index';
import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
interface That {
  field: () => _PiResolvedCommonViewFieldConfig;
}
let instance = new SignalToDataFactory().toData('children', (that: That) => {
  return that.field().children!();
});
let data = instance.getData();
export default {
  props: { activateIndex: { type: Number } },
  inject: { field: PI_VIEW_FIELD_TOKEN },

  data(vm) {
    return { ...data };
  },
  created() {
    instance.create(this);
  },
  beforeDestroy() {
    instance.destroy(this);
  },
};
</script>

<template>
  <piying-field-template :field="children[dInputs.activateIndex]"></piying-field-template>
</template>
