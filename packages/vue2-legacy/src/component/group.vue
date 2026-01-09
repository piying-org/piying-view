<script lang="ts">
import FieldTemplate from './field-template.vue';
import { PI_VIEW_FIELD_TOKEN } from '../token';
import { SignalToDataFactory } from '../util';
import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
interface That {
  field:()=> _PiResolvedCommonViewFieldConfig;
}
let instance = new SignalToDataFactory().toData('children', (that: That) => {
  return that.field().children!();
});
let data = instance.getData();
export default {
  name: 'PiyingViewGroup',
  components: {
    FieldTemplate,
  },
  inject: {
    field: PI_VIEW_FIELD_TOKEN,
  },
  data() {
    return {
      ...data,
    };
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
  <template v-for="(field, index) in children" :key="index">
    <FieldTemplate :field="field"></FieldTemplate>
  </template>
</template>
