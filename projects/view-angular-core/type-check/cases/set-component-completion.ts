/**
 * setComponent 的补全用例(框架无关)。
 *
 * core 侧的链路是:
 *
 *   setComponent(x) --ComponentKeyAt--> 组件标识 --框架翻译--> CompTables --工厂--> 补全
 *
 * 「组件类型 -> 表」这一步是框架特定的(Angular 读 input()/output(), Vue 读 $props),
 * 所以这里用 Translated<> 代表那张翻译结果, 验证的是「只要标识解析对了, 下游补全就对」。
 * 真实组件的端到端补全在各适配器包里覆盖。
 */
import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';
import type {
  ComponentKeyAt,
  CompTables,
  CompInputActionsFactory,
  CompOutputActionsFactory,
} from '@piying/view-angular-core';

/** 框架无关的组件占位: core 不读它内部, 只把它当标识传递 */
declare class RadioComp {}
declare class OtherComp {}

type RadioTables = CompTables & {
  inputKeys: 'options' | 'disabled';
  inputsOrigin: { options: string[]; disabled: boolean };
  outputKeys: 'changed';
  outputsOrigin: { changed: string };
  outputsHandlerMap: { changed: (v: string) => void };
  modelKeys: never;
  modelsOrigin: {};
};

type OtherTables = CompTables & {
  inputKeys: 'onlyMe';
  inputsOrigin: { onlyMe: string };
  outputKeys: never;
  outputsOrigin: {};
  outputsHandlerMap: {};
  modelKeys: never;
  modelsOrigin: {};
};

/** 代表框架侧的「标识 -> 表」翻译 */
type Translated<K> = K extends typeof RadioComp
  ? RadioTables
  : K extends typeof OtherComp
    ? OtherTables
    : never;

const Schema = v.object({
  byClass: v.pipe(v.string(), setComponent(RadioComp)),
  lastOne: v.pipe(v.string(), setComponent(OtherComp), setComponent(RadioComp)),
});

type TablesAt<P extends readonly string[]> = Translated<
  ComponentKeyAt<typeof Schema, P>
>;

declare const byClassInputs: CompInputActionsFactory<TablesAt<['byClass']>>;
declare const byClassOutputs: CompOutputActionsFactory<TablesAt<['byClass']>>;
declare const lastOneInputs: CompInputActionsFactory<TablesAt<['lastOne']>>;

// @complete setComponent(组件类) 解析成标识后, inputs.patch 补全该组件的 input
//   snapshot: disabled, options
const i1 = byClassInputs.patch({ '<|>' });

// @complete inputs.remove 补全 inputKeys 字面量
//   snapshot: disabled, options
const i2 = byClassInputs.remove(['<|>']);

// @complete outputs.patch 只补该组件的 output
//   snapshot: changed
const i3 = byClassOutputs.patch({ '<|>' });

// @complete 多个 setComponent: 按定义顺序取最后一个那个组件
//   snapshot: disabled, options
const i4 = lastOneInputs.patch({ '<|>' });

export { i1, i2, i3, i4 };
