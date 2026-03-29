import { Injector, Type } from '@angular/core';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { NgResolvedComponentDefine1 } from './group';
import {
  ViewAttributes,
  ViewInputs,
  ViewOutputs,
  LazyImport,
  LazyMarkType,
  ViewSlots,
  AsyncObjectSignal,
  ViewEvents,
} from '@piying/view-angular-core';
/** todo 这个没有支持 */
export interface RawDirectiveOutputs {
  [name: string]: (event: any) => void;
}

export interface DynamicComponentConfig {
  type:
    | Type<any>
    | LazyImport<Type<any>>
    | NgComponentDefine
    | LazyImport<NgComponentDefine>
    | LazyMarkType<Type<any>>
    | LazyMarkType<NgComponentDefine>;
  inputs: AsyncObjectSignal<ViewInputs>;
  outputs: AsyncObjectSignal<ViewOutputs>;
  attributes: AsyncObjectSignal<ViewAttributes>;
  events: AsyncObjectSignal<ViewEvents>;
  slots: AsyncObjectSignal<ViewSlots>;
  directives: DirectiveConfig[];
  injector?: Injector;
}

/** 解析后组件已经加载 ngcomponentoutlet */
export type NgResolvedComponentDefine2 = Omit<NgResolvedComponentDefine1, ''>;
/** component,wrapper通用定义 */
export type NgComponentDefine = {
  component: Type<any>;
  module?: Type<any>;
};

export interface ComponentVersion {
  __version?: 2;
}
