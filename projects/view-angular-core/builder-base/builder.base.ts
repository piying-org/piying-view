import {
  PI_FORM_BUILDER_OPTIONS_TOKEN,
  PI_FORM_BUILDER_ALIAS_MAP,
  PI_VIEW_CONFIG_TOKEN,
} from './type/token';
import {
  computed,
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
  toArray,
  KeyPath,
} from '../util';
import * as v from 'valibot';
import { FindConfigToken } from './find-config';
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
    const field = this.#buildControl(
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
    field.form.control?.updateInitValue(undefined);
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
    item.field.fixedChildren = signal(
      new SortedArray<_PiResolvedCommonViewFieldConfig>(
        (a, b) => a.priority - b.priority,
      ),
    );
    for (let index = 0; index < item.fields.length; index++) {
      this.#buildControl(item, item.fields[index], index);
    }
    if (item.type === 'group') {
      this.#buildGroup(item);
    } else {
      this.#buildArray(item);
    }
    item.field.children = computed(() => [
      ...item.field.fixedChildren!(),
      ...(item.field.restChildren?.() ?? []),
    ]);
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
      keyPath ??= parent.form.fixedControls$().length;
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
      define: define
        ? signal({ ...define, inputs, outputs, attributes })
        : undefined,
      wrappers,
      injector: this.#envInjector,
    } as any as _PiResolvedCommonViewFieldConfig;
    resolvedConfig =
      this.afterResolveConfig(field, resolvedConfig) ?? resolvedConfig;
    if (field.movePath) {
      this.#moveViewField(field.movePath, resolvedConfig);
    } else {
      if (
        (parent.type === 'group' || parent.type === 'array') &&
        !parent.skipAppend
      ) {
        parent.append(resolvedConfig);
      }
    }
    if (field.alias) {
      this.#scopeMap.set(field.alias, resolvedConfig);
    }
    resolvedConfig.hooks?.fieldResolved?.(resolvedConfig);
    if (isRoot) {
      parent.resolvedField$.set(resolvedConfig);
    }
    // 递归进行解析
    if (isGroup(field) || field.isLogicAnd || field.isLogicOr) {
      this.#buildField({
        type: 'group' as const,
        templateField: field.arrayChild,
        fields: field.children,
        field: resolvedConfig,
        form: (control || parent.form) as FieldGroup,
        append: (field) => {
          resolvedConfig.fixedChildren!().push(field);
        },
      });
    } else if (isArray(field) || field.isTuple) {
      this.#buildField({
        type: 'array' as const,
        templateField: field.arrayChild,
        fields: field.children,
        field: resolvedConfig,
        form: control as FieldArray,
        append: (field) => {
          resolvedConfig.fixedChildren!().push(field);
        },
      });
    }
    if (resolvedConfig.hooks?.allFieldsResolved) {
      this.#allFieldInitHookList.push(() => {
        resolvedConfig.hooks!.allFieldsResolved!(resolvedConfig);
      });
    }

    return resolvedConfig;
  }

  #buildGroup(buildItem: BuildGroupItem<SchemaHandle>) {
    const { templateField, form, field } = buildItem;

    if (templateField && field.form.control) {
      field.restChildren = signal([]);
      const isCheckedKey = (key: any) => {
        if (form.config$().groupKeySchema) {
          if (!v.safeParse(form.config$().groupKeySchema!, key).success) {
            return false;
          }
        }
        return true;
      };
      const updateItem = (key: string, initValue: boolean) => {
        const result = this.#createObjectRestItem(
          { ...buildItem, skipAppend: true },
          {
            ...templateField!,
            key,
          },
        );
        field.restChildren!.update((list) => [...list, result]);
        if (initValue) {
          result.form.control?.updateInitValue(form.initedValue?.[key]);
        }
        return result;
      };
      function removeItem(key: string) {
        field.restChildren!.update((list) => {
          const index = list.findIndex(
            (item) => item.keyPath!.slice(-1)[0] === key,
          );
          list = [...list];
          list.splice(index, 1);
          return list;
        });
        form.removeRestControl(key);
      }
      form.beforeUpdateList.push((restValue = {}, initUpdate) => {
        const restControl = form.resetControls$();
        for (const key in restControl) {
          if (key in restValue) {
            continue;
          }
          removeItem(key);
        }
        let isUpdateItem = false;
        for (const key in restValue) {
          if (key in restControl) {
            continue;
          }
          if (!isCheckedKey(key)) {
            continue;
          }
          isUpdateItem = true;
          updateItem(key, initUpdate);
        }
        if (isUpdateItem) {
          this.allFieldInitHookCall();
        }
      });
      field.action = {
        set: (value, key: string) =>
          untracked(() => {
            if (!isCheckedKey(key)) {
              return false;
            }

            const result = updateItem(key, true);
            this.allFieldInitHookCall();
            result.form.control!.updateValue(value);
            return true;
          }),
        remove: (key: string) => {
          untracked(() => {
            removeItem(key);
          });
        },
      };
    }
  }
  #createObjectRestItem(
    parent: BuildGroupItem<SchemaHandle> | BuildArrayItem<SchemaHandle>,
    // 单独一项
    field: AnyCoreSchemaHandle,
  ) {
    const result = this.#buildControl(parent, field as any, 0);
    this.#allFieldInitHookList.push(() => this.allFieldInitHookCall());
    return result;
  }

  #buildArray(buildItem: BuildArrayItem<SchemaHandle>) {
    const { templateField, form, field } = buildItem;

    if (templateField && field.form.control) {
      const fixedLength = field.fixedChildren?.().length ?? 0;
      field.restChildren = signal([]);
      const updateItem = (
        list: _PiResolvedCommonViewFieldConfig[],
        index: number,
        initValue: boolean,
      ) => {
        const result = this.#createArrayItem(
          buildItem,
          templateField,
          fixedLength + index,
        );
        list[index] = result;
        if (initValue) {
          result.form.control?.updateInitValue(
            form.initedValue?.[fixedLength + index],
          );
        }
        return result;
      };
      function removeItem(
        list: _PiResolvedCommonViewFieldConfig[],
        index: number,
      ) {
        const [deletedItem] = list!.splice(index, 1);
        form.removeRestControl(index);
        if (deletedItem) {
          deletedItem.injector!.destroy();
          (deletedItem.injector as any) = undefined;
        }
      }
      form.beforeUpdateList.push((resetValue = [], initUpdate) => {
        const controlLength = form.resetControls$().length;
        if (resetValue.length < controlLength) {
          const list = [...field.restChildren!()];
          for (
            let index = list.length - 1;
            index >= resetValue.length;
            index--
          ) {
            removeItem(list, index);
          }
          field.restChildren!.set(list);
        } else if (controlLength < resetValue.length) {
          const list = [...field.restChildren!()];
          for (let index = controlLength; index < resetValue.length; index++) {
            updateItem(list, index, initUpdate);
          }
          field.restChildren!.set(list);
          this.allFieldInitHookCall();
        }
      });
      field.action = {
        set: (value, index: number) =>
          untracked(() => {
            index = (
              typeof index === 'number'
                ? index
                : (field.restChildren?.().length ?? 0)
            )!;
            const list = [...field.restChildren!()];
            const result = updateItem(list, index, true);
            field.restChildren!.set(list);
            this.allFieldInitHookCall();
            result.form.control!.updateValue(value);
            return true;
          }),
        remove: (index: number) => {
          untracked(() => {
            const list = [...field.restChildren!()];
            removeItem(list, index);
            field.restChildren!.set(list);
          });
        },
      };
    }
  }
  #createArrayItem(
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
    const result = instance.#buildControl(
      { ...parent, skipAppend: true },
      field,
      index,
    );
    this.#allFieldInitHookList.push(() => instance.allFieldInitHookCall());
    result.injector = injector.get(EnvironmentInjector);
    return result;
  }
  #resolveComponent(type: string | any) {
    let define;
    let defaultConfig;
    // 查引用
    if (typeof type === 'string') {
      const config = this.#globalConfig?.types?.[type];
      if (!config) {
        throw new Error(`🈳define:[${type}]❗`);
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
  #moveViewField(key: KeyPath, inputField: _PiResolvedCommonViewFieldConfig) {
    const parent = fieldQuery(
      key,
      inputField,
      this.#scopeMap,
      this.#options.resolvedField$(),
    );

    if (!parent) {
      throw new Error('移动视图项失败');
    }
    const newKeyPath = inputField.fullPath.slice(parent.fullPath.length);
    (inputField as any).keyPath = newKeyPath;
    inputField.parent = parent as any;
    parent.fixedChildren!().push(inputField);
  }
  #findConfig = inject(FindConfigToken);
  #resolveWrappers(
    wrappers?: CoreRawWrapperConfig[],
  ): WritableSignal<CoreResolvedWrapperConfig[]> {
    const result = (wrappers ?? []).map((wrapper) => {
      const config = this.#findConfig.findWrapper(wrapper);
      return {
        inputs: signal(config.inputs),
        outputs: config.outputs,
        attributes: signal(config.attributes),
        type: config.type,
      };
    });
    return signal(result);
  }
}
