import { mount } from '@vue/test-utils';
import { PiyingView } from '@piying/view-vue';
import type { BaseSchema, SchemaWithPipe } from 'valibot';
import type { PiViewConfig } from '../../type/group';
import { computed, markRaw, nextTick, type ShallowRef } from 'vue';
import PiInput from '../component/input.vue';
import BlockWrapper from '../component/block-wrapper.vue';
import PiGroup from '../../component/group.vue';
import PiInputNumber from '../component/input-number.vue';
import PiInputCheckbox from '../component/input-checkbox.vue';
import PiInputSelect from '../component/input-select.vue';
import PiInputRadio from '../component/input-radio.vue';
import PiInputDynamic from '../component/input-dynamic.vue';
import { delay } from './delay';
export async function createComponent(
  schema: BaseSchema<any, any, any> | SchemaWithPipe<any>,
  model: ShallowRef,
  cmpOptions?: {
    defaultConfig?: PiViewConfig;
    context?: any;
    injector?: any;
  },
) {
  const options = computed(() => ({
    injector: cmpOptions?.injector,
    context: cmpOptions?.context,
    fieldGlobalConfig: {
      ...cmpOptions?.defaultConfig,
      types: {
        string: { type: markRaw(PiInput) },
        number: { type: markRaw(PiInputNumber) },
        boolean: { type: markRaw(PiInputCheckbox) },
        picklist: { type: markRaw(PiInputSelect) },
        radio: { type: markRaw(PiInputRadio) },
        dynamic: { type: markRaw(PiInputDynamic) },
        object: { type: markRaw(PiGroup) },
        array: { type: markRaw(PiGroup) },
        ...Object.entries(cmpOptions?.defaultConfig?.types ?? {}).reduce((obj, item) => {
          obj[item[0]] = {
            ...item[1],
            type: markRaw(item[1].type),
          };
          return obj;
        }, {} as any),
      },
      wrappers: {
        block: {
          type: markRaw(BlockWrapper),
        },
        ...Object.entries(cmpOptions?.defaultConfig?.wrappers ?? {}).reduce((obj, item) => {
          obj[item[0]] = {
            ...item[1],
            type: markRaw(item[1].type),
          };
          return obj;
        }, {} as any),
      },
    },
  }));
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

  const instance = mount(PiyingView, {
    props: {
      schema: markRaw(schema),
      options: markRaw(options.value),
      modelValue: model.value,
      'onUpdate:modelValue': (value: any) => {
        model.value = value;
      },
    },
  });
  await nextTick();
  await delay();
  return { instance };
}
