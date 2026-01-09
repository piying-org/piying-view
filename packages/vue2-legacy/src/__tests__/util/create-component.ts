import { mount } from '@vue/test-utils';
import { PiyingView } from '@piying/view-vue2-legacy';
import type { BaseSchema, SchemaWithPipe } from 'valibot';
import type { PiViewConfig } from '../../type/group';
import Vue from 'vue';
import PiInput from '../component/input.vue';
import BlockWrapper from '../component/block-wrapper.vue';
import PiGroup from '../../component/group.vue';
import PiInputNumber from '../component/input-number.vue';
import PiInputCheckbox from '../component/input-checkbox.vue';
import PiInputSelect from '../component/input-select.vue';
import PiInputRadio from '../component/input-radio.vue';
import PiInputDynamic from '../component/input-dynamic.vue';
import { delay } from './delay';
import type { ShallowRef } from './stub-ref';
export async function createComponent(
  schema: BaseSchema<any, any, any> | SchemaWithPipe<any>,
  model: ShallowRef,
  cmpOptions?: {
    defaultConfig?: PiViewConfig;
    context?: any;
  },
) {
  const options = {
    context: cmpOptions?.context,
    fieldGlobalConfig: {
      ...cmpOptions?.defaultConfig,
      types: {
        string: { type: PiInput },
        number: { type: PiInputNumber },
        boolean: { type: PiInputCheckbox },
        picklist: { type: PiInputSelect },
        radio: { type: PiInputRadio },
        dynamic: { type: PiInputDynamic },
        object: { type: PiGroup },
        array: { type: PiGroup },
        ...Object.entries(cmpOptions?.defaultConfig?.types ?? {}).reduce((obj, item) => {
          obj[item[0]] = {
            ...item[1],
            type: item[1].type,
          };
          return obj;
        }, {} as any),
      },
      wrappers: {
        block: {
          type: BlockWrapper,
        },
        ...Object.entries(cmpOptions?.defaultConfig?.wrappers ?? {}).reduce((obj, item) => {
          obj[item[0]] = {
            ...item[1],
            type: item[1].type,
          };
          return obj;
        }, {} as any),
      },
    },
  };
  // todo 渲染组件测试?
  // let xx = render(PiView, {
  //   props: {
  //     schema: schema,
  //     options: options.value,
  //     modelValue: model.value,
  //     'onUpdate:modelValue': (value: any) => {
  //       model.value = value;
  //     },
  //   },
  // });

  const instance = mount(PiyingView as any, {
    propsData: {
      schema: schema,
      options: options,
      modelValue: model.value,
      'onUpdate:modelValue': (value: any) => {
        model.value = value;
      },
    },
  });
  await Vue.nextTick();
  await delay();
  return { instance };
}
