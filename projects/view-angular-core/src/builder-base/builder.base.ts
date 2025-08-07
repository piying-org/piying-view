import {
  PI_FORM_BUILDER_OPTIONS_TOKEN,
  PI_FORM_BUILDER_ALIAS_MAP,
  PI_VIEW_CONFIG_TOKEN,
} from './type/token';
import {
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';

import { createField } from './create-field';
import { unWrapSignal } from './util/unwrap-signal';
import { DCONFIG_EFAULT_MERGE_STRAGEGY } from './const';
import { ParentMap } from './class/parent-map';

import { fieldQuery } from './field-query';

import {
  _PiResolvedCommonViewFieldConfig,
  ConfigMergeStrategy,
  CoreRawWrapperConfig,
  CoreResolvedWrapperConfig,
  PiCommonDefaultConfig,
  PiResolvedCommonViewFieldConfig,
} from './type/common-field-config';
import {
  BuildRootInputItem,
  BuildGroupItem,
  BuildArrayItem,
  BuildRootItem,
} from './type/builder.type';
import { FieldArray } from '../field/field-array';
import { FieldGroup } from '../field/field-group';
import { isFieldLogicGroup, isFieldArray } from '../field/is-field';
import { AnyCoreSchemaHandle, CoreSchemaHandle } from '../convert';
import { isArray, isGroup } from './util/is-group';
import {
  RawKeyPath,
  SortedArray,
  SignalInputValue,
  UnWrapSignal,
  clone,
  QueryPath,
  toArray,
} from '../util';

export class FormBuilder<SchemaHandle extends CoreSchemaHandle<any, any>> {
  #scopeMap =
    inject(PI_FORM_BUILDER_ALIAS_MAP, { optional: true }) ??
    new ParentMap<string, PiResolvedCommonViewFieldConfig<any, any>>();
  #options = inject(PI_FORM_BUILDER_OPTIONS_TOKEN);
  #injector = inject(Injector);
  #envInjector = inject(EnvironmentInjector);
  #globalConfig = inject(PI_VIEW_CONFIG_TOKEN);
  #allFieldInitHookList: (() => void)[] = [];

  buildRoot(item: BuildRootInputItem<SchemaHandle>) {
    this.#buildControl(
      {
        type: 'root',
        field: { fullPath: [] },
        form: undefined,
        resolvedField$: item.resolvedField$,
        append: () => {},
      },
      item.field,
      0,
    );

    this.allFieldInitHookCall();
  }
  allFieldInitHookCall() {
    const list = this.#allFieldInitHookList;
    this.#allFieldInitHookList = [];
    list.forEach((fn) => fn());
  }
  #buildField(
    item: BuildGroupItem<SchemaHandle> | BuildArrayItem<SchemaHandle>,
  ) {
    if (item.type === 'group') {
      this.#buildGroup(item);
    } else {
      this.#buildArray(item);
    }
  }
  afterResolveConfig(
    rawConfig: SchemaHandle,
    config: _PiResolvedCommonViewFieldConfig,
  ): _PiResolvedCommonViewFieldConfig | undefined {
    return;
  }

  #buildControl(
    parent:
      | BuildGroupItem<SchemaHandle>
      | BuildArrayItem<SchemaHandle>
      | BuildRootItem,
    // 单独一项
    field: SchemaHandle,
    index: number,
  ): PiResolvedCommonViewFieldConfig<any, any> {
    // 利用类型查引用,
    let viewDefaultConfig: PiCommonDefaultConfig | undefined;
    const type = field.type;
    let define;
    if (type) {
      const result = this.#resolveComponent(type);
      viewDefaultConfig = result.defaultConfig;
      define = result.define;
    }
    const mergeStrategy = this.#globalConfig?.defaultConfigMergeStrategy;

    const inputs = this.configMerge(
      [
        this.#globalConfig?.defaultConfig?.inputs,
        viewDefaultConfig?.inputs,
        field.inputs,
      ],
      false,
      mergeStrategy?.inputs ?? DCONFIG_EFAULT_MERGE_STRAGEGY.inputs,
    );
    const outputs = this.configMerge(
      [
        this.#globalConfig?.defaultConfig?.outputs,
        viewDefaultConfig?.outputs,
        field.outputs,
      ],
      false,
      mergeStrategy?.outputs ?? DCONFIG_EFAULT_MERGE_STRAGEGY.outputs,
    );
    const attributes = this.configMerge(
      [
        this.#globalConfig?.defaultConfig?.attributes,
        viewDefaultConfig?.attributes,
        field.attributes,
      ],
      false,
      mergeStrategy?.attributes ?? DCONFIG_EFAULT_MERGE_STRAGEGY.attributes,
    );
    const wrappers1 = this.configMergeRaw(
      [
        this.#globalConfig?.defaultConfig?.wrappers,
        viewDefaultConfig?.wrappers,
        field.wrappers,
      ],
      true,
      mergeStrategy?.wrappers ?? DCONFIG_EFAULT_MERGE_STRAGEGY.wrappers,
    );
    const wrappers = this.#resolveWrappers(wrappers1);
    const props = this.configMerge(
      [
        this.#globalConfig?.defaultConfig?.props,
        viewDefaultConfig?.props,
        field.props,
      ],
      false,
      mergeStrategy?.props ?? DCONFIG_EFAULT_MERGE_STRAGEGY.props,
    );

    const formConfig$ = this.configMerge(
      [
        this.#globalConfig?.defaultConfig?.formConfig,
        viewDefaultConfig?.formConfig,
        field.formConfig,
      ],
      false,
      mergeStrategy?.formConfig ?? DCONFIG_EFAULT_MERGE_STRAGEGY.formConfig,
    );
    const renderConfig = this.configMerge(
      [
        this.#globalConfig?.defaultConfig?.renderConfig,
        viewDefaultConfig?.renderConfig,
        field.renderConfig,
      ],
      false,
      mergeStrategy?.renderConfig ?? DCONFIG_EFAULT_MERGE_STRAGEGY.renderConfig,
    );
    let control;
    let keyPath: RawKeyPath | undefined = field.key;

    if (isFieldLogicGroup(parent.form)) {
      keyPath ??= parent.form.controls$().length;
    } else if (isFieldArray(parent.form)) {
      keyPath ??= index;
    }
    const isRoot = parent.type === 'root';
    if (!field.nonFieldControl && (keyPath !== undefined || isRoot)) {
      control = createField(
        parent.form as any,
        field,
        keyPath!,
        // 这里也是fullPath
        formConfig$,
        isRoot,
        this.#injector,
      );
    }
    const rootForm = this.#options.form$$;
    let resolvedConfig = {
      id: field.id,
      keyPath: toArray(keyPath),
      get fullPath() {
        return [
          ...resolvedConfig.parent.fullPath,
          ...(resolvedConfig.keyPath ?? []),
        ];
      },
      form: {
        parent: parent.form,
        control: control ?? (isGroup(field) ? parent.form : undefined),
        get root() {
          return rootForm();
        },
      },
      get: (keyPath: any) =>
        untracked(() =>
          fieldQuery(
            keyPath,
            resolvedConfig,
            this.#scopeMap,
            this.#options.resolvedField$(),
          ),
        ),
      parent: parent.field,
      origin: field,
      renderConfig: renderConfig,
      formConfig: formConfig$,
      props,
      context: this.#options.context,
      priority: field.priority,
      hooks: field.hooks,
      alias: field.alias,
      inputs: inputs,
      outputs: outputs,
      attributes,
      define: define ? { ...define, inputs, outputs, attributes } : undefined,
      wrappers,
    } as any as _PiResolvedCommonViewFieldConfig;
    resolvedConfig =
      this.afterResolveConfig(field, resolvedConfig) ?? resolvedConfig;
    if (field.movePath) {
      this.#moveViewField(field.movePath, resolvedConfig);
    } else {
      parent.append(resolvedConfig);
    }
    if (field.alias) {
      this.#scopeMap.set(field.alias, resolvedConfig);
    }
    resolvedConfig.hooks?.fieldResolved?.(resolvedConfig);
    if (isRoot) {
      parent.resolvedField$.set(resolvedConfig);
    }
    // 递归进行解析
    if (
      isGroup(field) ||
      field.isLogicAnd ||
      field.isLogicOr ||
      field.isTuple
    ) {
      resolvedConfig.fieldGroup = signal(
        new SortedArray<_PiResolvedCommonViewFieldConfig>(
          (a, b) => a.priority - b.priority,
        ),
      );
      this.#buildField({
        type: 'group' as const,
        fields: field.children,
        field: resolvedConfig,
        form: (control || parent.form) as FieldGroup,
        append: (field) => {
          resolvedConfig.fieldGroup!().push(field);
        },
      });
    } else if (isArray(field)) {
      this.#buildField({
        type: 'array' as const,
        templateField: field.arrayChild,
        field: resolvedConfig,
        form: control as FieldArray,
        append: (field) => {},
      });
    }
    if (resolvedConfig.hooks?.allFieldsResolved) {
      this.#allFieldInitHookList.push(() => {
        resolvedConfig.hooks!.allFieldsResolved!(resolvedConfig);
      });
    }

    return resolvedConfig;
  }

  #buildGroup(groupItem: BuildGroupItem<SchemaHandle>) {
    for (let index = 0; index < groupItem.fields.length; index++) {
      const field = groupItem.fields[index];
      this.#buildControl(groupItem, field, index);
    }

    /** 虚拟group不存在hooks */
    const field = groupItem.field as PiResolvedCommonViewFieldConfig<any, any>;
    field.hooks?.afterChildrenInit?.(field);
  }
  createArrayItem(
    parent: BuildGroupItem<SchemaHandle> | BuildArrayItem<SchemaHandle>,
    // 单独一项
    field: AnyCoreSchemaHandle,
    index: number,
  ) {
    const Builder = this.constructor as any as typeof FormBuilder;
    const injector = Injector.create({
      providers: [
        Builder,
        {
          provide: PI_FORM_BUILDER_ALIAS_MAP,
          useValue: new ParentMap<
            string,
            PiResolvedCommonViewFieldConfig<any, any>
          >(this.#scopeMap),
        },
        { provide: EnvironmentInjector, useFactory: () => injector },
      ],
      parent: this.#envInjector,
    });
    this.#envInjector.get(DestroyRef).onDestroy(() => {
      result.injector?.destroy();
    });
    const instance = injector.get(Builder);
    const result = instance.#buildControl(parent, field, index);
    this.#allFieldInitHookList.push(() => instance.allFieldInitHookCall());
    result.injector = injector.get(EnvironmentInjector);
    return result;
  }
  #buildArray(arrayItem: BuildArrayItem<SchemaHandle>) {
    const { templateField, form } = arrayItem;

    arrayItem.field.action = {
      // 因为数组需要有动态添加的能力,所以才加上,group不需要
      set: (value, index) => {
        untracked(() => {
          index = (
            typeof index === 'number'
              ? index
              : (arrayItem.field.fieldArray?.().length ?? 0)
          )!;
          const result = this.createArrayItem(arrayItem, templateField, index);
          const list = [...arrayItem.field.fieldArray!()];
          list[index] = result;
          arrayItem.field.fieldArray!.set(list);
          this.allFieldInitHookCall();
          result.form.control!.updateValue(value);
        });
      },
      remove: (index: number) => {
        untracked(() => {
          const list = [...arrayItem.field.fieldArray!()];
          const [deletedItem] = list!.splice(index, 1);
          arrayItem.field.fieldArray!.set(list);
          form.removeAt(index);
          if (deletedItem) {
            deletedItem.injector!.destroy();
            deletedItem.injector = undefined;
          }
        });
      },
    };
    arrayItem.field.fieldArray = signal([]);
    arrayItem.field.hooks?.afterChildrenInit?.(arrayItem.field);

    form.beforeUpdateList.push((input) => {
      const controlLength = form.controls$().length;
      if (controlLength < input.length) {
        const list = arrayItem.field.fieldArray!().slice();
        for (let index = controlLength; index < input.length; index++) {
          const result = this.createArrayItem(
            arrayItem,
            arrayItem.templateField,
            index,
          );
          list[index] = result;
        }
        arrayItem.field.fieldArray!.set(list);
      } else if (input.length < controlLength) {
        const list = arrayItem.field.fieldArray!().slice();
        for (
          let index = arrayItem.field.fieldArray!().length - 1;
          index >= input.length;
          index--
        ) {
          const [deletedItem] = list.splice(index, 1);
          form.removeAt(index);
          if (deletedItem) {
            deletedItem.injector?.destroy();
            deletedItem.injector = undefined;
          }
        }
        arrayItem.field.fieldArray!.set(list);
      }
      this.allFieldInitHookCall();
    });
  }

  #resolveComponent(type: string | any) {
    let define;
    let defaultConfig;
    // 查引用
    if (typeof type === 'string') {
      const config = this.#globalConfig?.types?.[type];
      if (!config) {
        throw new Error(`define:未注册[${type}]`);
      }
      defaultConfig = config;
      if (Object.keys(config).length) {
        define = {
          ...config,
        };
        return {
          define: { ...config },
          defaultConfig,
        };
      }
    } else {
      return { define: { type: type } };
    }
    return {
      define,
      defaultConfig,
    };
  }

  protected configMergeRaw<T extends SignalInputValue<any>>(
    list: T[],
    isArray: boolean,
    strategy: ConfigMergeStrategy,
  ): UnWrapSignal<NonNullable<T>> {
    let value;
    if (isArray) {
      if (strategy === 'merge') {
        value = list
          .filter(Boolean)
          .flat()
          .map((item) => unWrapSignal(item)) as any;
      } else {
        value = list.reduce(
          (data, item: any) => unWrapSignal(item) ?? data,
          [],
        ) as any;
      }
    } else {
      if (strategy === 'merge') {
        value = list.reduce(
          (obj, item: any) => ({
            ...obj,
            ...unWrapSignal(item),
          }),
          {},
        ) as any;
      } else {
        value = list.reduce(
          (data, item: any) => unWrapSignal(item) ?? data,
          {},
        ) as any;
      }
    }
    return clone(value) as any;
  }
  /**
   * 后面覆盖前面
   * */
  protected configMerge<T extends SignalInputValue<any>>(
    list: T[],
    isArray: boolean,
    strategy: ConfigMergeStrategy,
  ): WritableSignal<UnWrapSignal<NonNullable<T>>> {
    return signal(this.configMergeRaw(list, isArray, strategy));
  }
  #moveViewField(key: QueryPath, inputField: _PiResolvedCommonViewFieldConfig) {
    const parent = fieldQuery(
      key,
      inputField,
      this.#scopeMap,
      this.#options.resolvedField$(),
    );

    if (!parent) {
      throw new Error('移动视图项失败');
    }
    const index = inputField.parent
      .fieldGroup?.()
      .findIndex((item) => item === inputField);
    if (typeof index === 'number' && index !== -1) {
      inputField.parent.fieldGroup?.().splice(index, 1);
    }
    const newKeyPath = inputField.fullPath.slice(parent.fullPath.length);
    (inputField as any).keyPath = newKeyPath;
    inputField.parent = parent as any;
    parent.fieldGroup!().push(inputField);
  }
  #resolveWrappers(
    wrappers?: CoreRawWrapperConfig[],
  ): WritableSignal<CoreResolvedWrapperConfig[]> {
    const result = (wrappers ?? []).map((wrapper) => {
      // 查引用1
      if (typeof wrapper === 'string') {
        const config = this.#globalConfig?.wrappers?.[wrapper];
        if (!config) {
          throw new Error(`wrapper:未注册[${wrapper}]`);
        }
        return {
          ...config,
          inputs: signal(config.inputs),
          attributes: signal(config.attributes),
        };
      } else if (typeof wrapper.type === 'string') {
        // 查引用2
        const config = this.#globalConfig?.wrappers?.[wrapper.type];
        if (!config) {
          throw new Error(`wrapper:未注册[${wrapper.type}]`);
        }
        return {
          inputs: signal({ ...config.inputs, ...wrapper.inputs }),
          outputs: { ...config.outputs, ...wrapper.outputs },
          attributes: signal({ ...config.attributes, ...wrapper.attributes }),
          type: config.type,
        };
      } else {
        return {
          ...wrapper,
          inputs: signal(wrapper.inputs),
          attributes: signal(wrapper.attributes),
        };
      }
    });
    return signal(result);
  }
}
