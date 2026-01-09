<script lang="ts">
import * as v from 'valibot';
import { convert, type _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createInjector,
  createRootInjector,
  DestroyRef,
  Injector,
  R3Injector,
  untracked,
  type EffectRef,
} from 'static-injector';
import { VueSchemaHandle } from '../vue-schema';
import { VueFormBuilder } from '../builder';
import { InjectorToken } from '../token';
import FieldTemplate from './field-template.vue';
import { initListen } from '@piying/view-core';
import type { Prop } from 'vue/types/options';
interface That {
  schema: v.BaseSchema<any, any, any>;
  modelValue?: any;
  options: any;
}
export default {
  name: 'PiyingView',
  components: {
    FieldTemplate,
  },
  props: {
    schema: {
      type: Object as Prop<v.BaseSchema<any, any, any>>,
      required: true,
    },
    modelValue: {
      type: null,
    },
    options: {
      type: null,
    },
  },
  data() {
    return {
      subInjector: null,
      injectorDispose: null,
      effectRef: null,
      rootInjector: createRootInjector({
        providers: [
          {
            provide: ChangeDetectionScheduler,
            useClass: ChangeDetectionSchedulerImpl,
          },
        ],
      }),
    };
  },
  computed: {
    initResult: function () {
      (this as any)['##injectorDispose']?.();
      // injectorDispose?.();
      const subInjector = createInjector({ providers: [], parent: this.rootInjector });
      (this as any)['##injectorDispose'] = () => {
        subInjector.destroy();
        (this as any)['##injectorDispose'] = undefined;
      };
      const field = convert(this.schema as any, {
        handle: VueSchemaHandle as any,
        builder: VueFormBuilder,
        injector: subInjector,
        registerOnDestroy: (fn) => {
          subInjector!.get(DestroyRef).onDestroy(() => {
            fn();
          });
        },
        ...this.options,
      });
      return [field, subInjector] as const;
    },
    field: function () {
      return this.initResult[0];
    },
    listenInit: function () {
      return [this.initResult, this.modelValue];
    },
  },
  watch: {
    listenInit: {
      handler: function (value) {
        let field = value[0][0] as _PiResolvedCommonViewFieldConfig;
        let subInjector = value[0][1] as R3Injector;
        let modelValue = value[1];
        (this as any)['##listenInitDispose']?.();

        if (field.form.control) {
          (this as any)['##listenInitDispose'] = initListen(
            modelValue,
            field!.form.control!,
            subInjector as Injector,
            (value) => {
              untracked(() => {
                if (field!.form.control?.valueNoError$$()) {
                  this.$emit('update:modelValue', value);
                }
              });
            },
          ).destroy;
          field!.form.control!.updateValue(this.modelValue);
        }
      },
    },
  },
  provide() {
    return {
      [InjectorToken]: () => {
        return this.rootInjector;
      },
    };
  },

  beforeDestroy() {
    (this as any)['##injectorDispose']?.();
    (this as any)['##listenInitDispose']?.();
  },
};
</script>

<template>
  <FieldTemplate :field="field" />
</template>

<style scoped></style>
