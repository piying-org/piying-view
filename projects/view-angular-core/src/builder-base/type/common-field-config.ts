import { EnvironmentInjector, Signal, WritableSignal } from '@angular/core';

import { FieldArray } from '../../field/field-array';
import { FieldControl } from '../../field/field-control';
import { FieldGroup } from '../../field/field-group';
import { FieldLogicGroup } from '../../field/field-logic-group';
import { AnyCoreSchemaHandle, CoreSchemaHandle } from '../../convert';
import { KeyPath, SetWrapper$, Wrapper$, LazyImport } from '../../util';
export interface FieldRenderConfig {
  hidden?: boolean;
}
/** 全局定义使用 */
export type CoreRawComponentDefine = {
  type: any;
  attributes?: Record<string, any>;
  inputs?: CoreRawViewInputs;
  outputs?: CoreRawViewOutputs;
};
/** 解析后define使用 */
export type CoreResolvedComponentDefine = SetWrapper$<
  CoreRawComponentDefine,
  'attributes' | 'inputs'
>;
export interface HookConfig<RESOLVED_FIELD> {
  /** 配置刚被解析 */
  fieldResolved?: (field: RESOLVED_FIELD) => void;
  /** 子级已经初始化,每次array添加都会触发 */
  afterChildrenInit?: (field: RESOLVED_FIELD) => void;
  /** 所有feilds初始化后执行,也就是可以进行表单监听 */
  allFieldsResolved?: (field: RESOLVED_FIELD) => void;
  /** todo 此hook暂时没有使用到 创建组件之前 */
  beforeCreateComponent?: (field: RESOLVED_FIELD) => void;
  /** todo 此hook暂时没有使用到 组件创建,获取componentRef */
  afterCreateComponent?: (field: RESOLVED_FIELD) => void;
}

export type PiResolvedCommonViewFieldConfig<
  SelfResolvedFn extends () => any,
  Define,
> = {
  readonly hooks: HookConfig<ReturnType<SelfResolvedFn>>;
  // 额外
  readonly id?: string;
  /** 查询时使用 */
  readonly keyPath?: KeyPath | undefined;
  readonly fullPath: KeyPath;
  readonly props: WritableSignal<Record<string, any>>;
  fieldGroup?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
  fieldArray?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
  fieldRestGroup?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
  parent: ReturnType<SelfResolvedFn>;
  readonly form: {
    readonly control?: FieldGroup | FieldArray | FieldControl | FieldLogicGroup;
    readonly parent: FieldGroup | FieldArray | FieldLogicGroup;
    readonly root: FieldGroup | FieldArray | FieldControl | FieldLogicGroup;
  };
  /** 仅用来开发时debug使用 */
  readonly origin: any;
  /**
   * @internal
   * 仅数组子项使用
   */
  injector?: EnvironmentInjector;
  /** 外部传入引用 */
  readonly context?: any;

  get: (
    keyPath: KeyPath,
    aliasNotFoundFn?: (
      name: string,
      field: PiResolvedCommonViewFieldConfig<any, any>,
    ) => PiResolvedCommonViewFieldConfig<any, any>,
  ) => ReturnType<SelfResolvedFn> | undefined;
  action: {
    set: (value: any, index?: any) => void;
    remove: (index: any) => void;
  };
  readonly define?: Define;

  wrappers: WritableSignal<CoreResolvedWrapperConfig[]>;
} & Readonly<Pick<AnyCoreSchemaHandle, 'priority' | 'alias'>> &
  Readonly<
    Wrapper$<
      Required<
        Pick<
          AnyCoreSchemaHandle,
          'inputs' | 'outputs' | 'attributes' | 'formConfig' | 'renderConfig'
        >
      >
    >
  >;
export type _PiResolvedCommonViewFieldConfig = PiResolvedCommonViewFieldConfig<
  () => _PiResolvedCommonViewFieldConfig,
  CoreResolvedComponentDefine
>;

export type ConfigMergeStrategy = 'merge' | 'replace';

export type PiCommonDefaultConfig = Partial<
  Pick<
    CoreSchemaHandle<any, any>,
    | 'formConfig'
    | 'props'
    | 'renderConfig'
    | 'inputs'
    | 'outputs'
    | 'wrappers'
    | 'attributes'
  > & { type: any }
>;

export interface FormBuilderOptions<T> {
  form$$: Signal<FieldGroup>;
  resolvedField$: WritableSignal<T>;
  context: any;
}

export type CoreRawViewInputs = Record<string, any>;
export type CoreRawViewAttributes = Record<string, any>;
export type CoreRawProps = Record<string, any>;
export interface CoreRawViewOutputs {
  [name: string]: (event: any) => void;
}

export type CoreWrapperConfig1 = {
  type: string | any | LazyImport<any>;
  attributes?: CoreRawViewAttributes;
  inputs?: CoreRawViewInputs;
  outputs?: CoreRawViewOutputs;
};
export type CoreRawWrapperConfig = string | CoreWrapperConfig1;
export type CoreResolvedWrapperConfig = {
  type: any | LazyImport<any>;
  attributes: WritableSignal<CoreRawViewAttributes | undefined>;
  inputs: WritableSignal<CoreRawViewInputs | undefined>;
  outputs?: CoreRawViewOutputs;
};
