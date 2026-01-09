<script lang="ts">
import { PI_VIEW_FIELD_TOKEN, SignalToDataFactory } from '@piying/view-vue2-legacy';
import { PiyingFieldTemplate } from '@piying/view-vue2-legacy';
import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
interface That {
  field:()=> _PiResolvedCommonViewFieldConfig;
}

let instance = new SignalToDataFactory()
  .toData('fixedChildren', (that: That) => that.field().fixedChildren!())
  .toData('restChildren', (that: That) => that.field().restChildren!());
let data = instance.getData();
export default {
  inject: { field: PI_VIEW_FIELD_TOKEN },
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
  <div class="fields">
    <template v-for="(field, index) in fixedChildren" :key="index">
      <PiyingFieldTemplate :field="field!"></PiyingFieldTemplate>
    </template>
  </div>
  <div class="rest-fields">
    <template v-for="(field, index) in restChildren" :key="index">
      <PiyingFieldTemplate :field="field!"></PiyingFieldTemplate>
    </template>
  </div>
</template>
