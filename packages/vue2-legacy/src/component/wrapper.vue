<script lang="ts">
// import SelfComponent from './wrapper.vue';
import type { CoreWrapperConfig } from '@piying/view-core';
import { SignalToDataFactory } from '../util/signal-convert';
import type { Prop } from 'vue/types/options';
interface That {
  wrappers: CoreWrapperConfig[];
  wrapper: CoreWrapperConfig;
}
let instance = new SignalToDataFactory().toData('inputs', (that: That) => {
  return { ...that.wrapper.inputs(), ...that.wrapper.attributes() };
});
let data = instance.getData();
export default {
  name: 'Wrapper',
  components: {},
  data: () => {
    return {
      ...data,
    };
  },
  props: {
    wrappers: {
      type: Array as Prop<CoreWrapperConfig[]>,
      required: true,
    },
  },
  computed: {
    restWrappers() {
      return this.wrappers.slice(1);
    },
    wrapper() {
      return this.wrappers[0];
    },
    outputs() {
      return this.wrapper?.outputs?.() ?? {};
    },
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
  <template v-if="wrapper">
    <component :is="wrapper.type" v-bind="inputs" v-on="outputs">
      <Wrapper :wrappers="restWrappers">
        <slot></slot>
      </Wrapper>
    </component>
  </template>
  <template v-else>
    <slot></slot>
  </template>
</template>

<style scoped></style>
