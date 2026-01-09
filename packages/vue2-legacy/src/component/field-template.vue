<script lang="ts">
import { SignalToDataFactory } from '../util/signal-convert';
import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '../token';
import PiWrapper from './wrapper.vue';
import {
  createViewControlLink,
  getLazyImport,
  isFieldControl,
  isLazyMark,
  type _PiResolvedCommonViewFieldConfig,
} from '@piying/view-core';
import type { Prop } from 'vue/types/options';

interface That {
  field: _PiResolvedCommonViewFieldConfig;
}
let sd = new SignalToDataFactory();
let instance = sd
  .toData('inputs', (that: That) => {
    return that.field.inputs();
  })
  .toData('outputs', (that: That) => {
    return that.field.outputs();
  })
  .toData('renderConfig', (that: That) => {
    return that.field.renderConfig();
  })
  .toData('attributes', (that: That) => {
    return that.field.attributes();
  })
  .toData('fieldChildren', (that: That) => {
    return that.field.children?.();
  })
  .toData('wrappers', (that: That) => {
    return that.field.wrappers();
  })
  .toData('define', (that: That) => {
    return that.field.define?.();
  });
let data = instance.getData();

export default {
  name: 'FieldTemplate',
  components: { PiWrapper },
  props: { field: { type: Object as Prop<_PiResolvedCommonViewFieldConfig>, required: true } },
  inject: { injector: InjectorToken },
  provide() {
    return {
      [PI_VIEW_FIELD_TOKEN]: () => {
        return this.field;
      },
    };
  },
  data() {
    return {
      ...data,
    };
  },
  computed: {
    fieldInput() {
      return {
        ...this.attributes,
        ...this.inputs,
      };
    },
    componentType() {
      // todo需要异步测试
      return typeof this.define.type === 'function' || isLazyMark(this.define.type)
        ? getLazyImport<any>(this.define?.type)
        : this.define?.type;
    },
  },
  watch: {
    childRef: () => {
      console.log('有两??');
    },
  },
  created: function () {
    instance.create(this);
  },

  mounted: function () {
    // todo 需要测试
    (this as any)['_dispose']?.();
    let a = this.$refs['childRef']!;
    console.log('引用?', a);

    if (isFieldControl(this.field.form.control)) {
      (this as any)['_dispose'] = createViewControlLink(
        (() => this.field.form.control) as any,
        (this.$refs['childRef'] as any)['cva'] as any,
        (this as any).injector,
      );
    }
  },
  beforeDestroy() {
    (this as any)['_dispose']?.(true);
    (this as any)['_dispose'] = undefined;
    instance.destroy(this);
  },
};
</script>

<template>
  <template v-if="!renderConfig.hidden">
    <template v-if="define && define.type">
      <pi-wrapper :wrappers="wrappers">
        <!-- group -->
        <template v-if="fieldChildren">
          <component :is="componentType" v-bind="fieldInput" v-on="outputs"></component>
        </template>
        <!-- control -->
        <template v-else>
          <template v-if="field.form.control">
            <component
              :is="componentType"
              v-bind="fieldInput"
              v-on="outputs"
              ref="childRef"
            ></component>
          </template>
          <template v-else>
            <component :is="componentType" v-bind="fieldInput" v-on="outputs"></component>
          </template>
        </template>
      </pi-wrapper>
    </template>
  </template>
</template>

<style scoped></style>
