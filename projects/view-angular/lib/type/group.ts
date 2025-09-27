import { Signal, Type, WritableSignal } from '@angular/core';

import { NgComponentDefine, RawDirectiveOutputs } from './component';
import { DirectiveConfig } from '../component/dynamic-define.component';
import {
  CoreRawComponentDefine,
  CoreResolvedComponentDefine,
  CoreResolvedWrapperConfig,
  LazyMarkType,
  PiResolvedCommonViewFieldConfig,
} from '@piying/view-angular-core';
import { NgSchemaHandle } from '../schema/ng-schema';
import { LazyImport } from '@piying/view-angular-core';
/** 指令配置 */
export type NgDirectiveConfig = Omit<DirectiveConfig, 'inputs' | 'outputs'> & {
  inputs?: Signal<Record<string, any>>;
  outputs?: RawDirectiveOutputs;
};
/** 用于全局可选配置 */
export type PiDefaultRawViewFieldConfig = Pick<
  NgSchemaHandle,
  | 'inputs'
  | 'outputs'
  | 'wrappers'
  | 'formConfig'
  // | 'hooks'
  | 'renderConfig'
  | 'props'
  | 'directives'
  | 'attributes'
>;
export type NgRawComponentDefine = Omit<CoreRawComponentDefine, 'type'> & {
  type:
    | string
    | Type<any>
    | LazyImport<Type<any>>
    | NgComponentDefine
    | LazyImport<NgComponentDefine>
    | LazyMarkType<Type<any>>
    | LazyMarkType<NgComponentDefine>;
  selector?: string;
};
/** 解析后但是未加载 */
export type NgResolvedComponentDefine1 = Omit<
  CoreResolvedComponentDefine,
  'type'
> & {
  type:
    | string
    | Type<any>
    | LazyImport<Type<any>>
    | NgComponentDefine
    | LazyImport<NgComponentDefine>
    | LazyMarkType<Type<any>>
    | LazyMarkType<NgComponentDefine>;
  selector?: string;
};

export type PiResolvedViewFieldConfig = PiResolvedCommonViewFieldConfig<
  () => PiResolvedViewFieldConfig,
  NgResolvedComponentDefine1
> & {
  directives?: WritableSignal<NgDirectiveConfig[]>;
};

export type NgResolvedWraaperConfig = Omit<
  CoreResolvedWrapperConfig,
  'type'
> & {
  type: NgComponentDefine;
};
