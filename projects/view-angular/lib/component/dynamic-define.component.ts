import { Type, WritableSignal } from '@angular/core';
import {
  AsyncObjectSignal,
  ViewAttributes,
  ViewEvents,
  ViewInputs,
  ViewOutputs,
} from '@piying/view-angular-core';

export type DirectiveConfig<T = any> = {
  /** string表示是标签,type<any>是组件或者指令 */
  type: Type<T>;
  inputs?: AsyncObjectSignal<ViewInputs>;
  outputs?: AsyncObjectSignal<ViewOutputs>;
  events?: AsyncObjectSignal<ViewEvents>;
  model?: AsyncObjectSignal<Record<string, WritableSignal<any>>>;
  attributes?: AsyncObjectSignal<ViewAttributes>;
};
