import { Type, Signal, WritableSignal } from '@angular/core';
import {
  CoreRawViewAttributes,
  CoreRawViewOutputs,
} from '@piying/view-angular-core';

export type DirectiveConfig<T = any> = {
  /** string表示是标签,type<any>是组件或者指令 */
  type: Type<T> | string;
  inputs?: Signal<Record<string, any>>;
  outputs?: CoreRawViewOutputs;
  model?: Record<string, WritableSignal<any>>;
  selector?: string;
  attributes?: Signal<CoreRawViewAttributes | undefined>;
};
