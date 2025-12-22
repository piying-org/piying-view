import { Type, WritableSignal } from '@angular/core';
import {
  AsyncObjectSignal,
  ViewAttributes,
  ViewOutputs,
} from '@piying/view-angular-core';

export type DirectiveConfig<T = any> = {
  /** string表示是标签,type<any>是组件或者指令 */
  type: Type<T>;
  inputs?: AsyncObjectSignal<Record<string, any> | undefined>;
  outputs?: AsyncObjectSignal<ViewOutputs | undefined>;
  events?: AsyncObjectSignal<Record<string, (event: any) => void> | undefined>;
  model?: Record<string, WritableSignal<any>>;
  attributes?: AsyncObjectSignal<ViewAttributes | undefined>;
};
