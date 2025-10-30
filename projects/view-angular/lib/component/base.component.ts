import {
  ApplicationRef,
  computed,
  createComponent,
  createNgModule,
  Directive,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Injector,
  inputBinding,
  outputBinding,
  PendingTasks,
  signal,
  Signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { ComponentRawType, PiResolvedViewFieldConfig } from '../type';
import { DynamicComponentConfig, NgComponentDefine } from '../type/component';
import {
  ComponentCheckConfig,
  getComponentCheckConfig,
} from '../util/component-config.equal';
import { deepEqual } from 'fast-equals';
import {
  PI_COMPONENT_INDEX,
  PI_COMPONENT_LIST,
  PI_COMPONENT_LIST_LISTEN,
  PI_VIEW_FIELD_TOKEN,
} from '../type/view-token';
import {
  CoreRawViewAttributes,
  CoreRawViewInputs,
  CoreRawViewOutputs,
  getLazyImport,
  isLazyMark,
} from '@piying/view-angular-core';
import { AttributesDirective } from '../directives/attributes.directive';
import { isComponentType } from '../util/async-cache';
function createInputsBind(inputs?: Signal<CoreRawViewInputs | undefined>) {
  if (!inputs || !inputs()) {
    return [];
  }
  return Object.keys(inputs()!).map((key) =>
    inputBinding(
      key,
      computed(() => inputs()![key]),
    ),
  );
}
function createOutputsBind(outputs?: CoreRawViewOutputs) {
  if (!outputs) {
    return [];
  }
  return Object.entries(outputs).map(([key, value]) =>
    outputBinding(key, value),
  );
}
function createAttributesDirective(
  attributes: Signal<CoreRawViewAttributes | undefined>,
) {
  if (attributes()) {
    return [
      {
        type: AttributesDirective,
        bindings: [inputBinding('attributes', attributes)],
      },
    ];
  }
  return [];
}
const EmptyOBJ = {};
@Directive()
export class BaseComponent {
  /** 第一次默认为空 */
  #index = inject(PI_COMPONENT_INDEX, { optional: true }) ?? 0!;

  /** 发射提供到下一级 */
  #eventEmitter!: EventEmitter<DynamicComponentConfig[]>;
  #componentConfig!: DynamicComponentConfig;
  #viewContainerRef?: ViewContainerRef;

  destroyComponentFn?: () => void;
  fieldComponentInstance?: any;
  fieldElementRef?: ElementRef<HTMLElement>;
  fieldDirectiveRefList?: any[];
  /** 比较时使用 */
  #componentCheckConfig$$!: Signal<ComponentCheckConfig>;
  #setComponentCheck(config: DynamicComponentConfig) {
    this.#componentCheckConfig$$ = computed(() =>
      untracked(() => getComponentCheckConfig(config)),
    );
  }
  setFieldData(field: Signal<PiResolvedViewFieldConfig>, index: number) {
    this.#index = index;
  }
  /**
   * 输入引用绑定
   * 1. 上次传入的数据格式和当前一样,只触发更新
   * 2. 上次传入的数据格式和当前不一样,直接重新创建
   */
  #inputCache!: {
    inputs?: Signal<Record<string, any>>;
    attributes?: Signal<Record<string, any>>;
    directiveList?: (Signal<Record<string, any>> | undefined)[];
  };
  #configUpdate$ = signal(0);
  #app = inject(ApplicationRef);
  #task = inject(PendingTasks);
  #loadComponent(
    type: ComponentRawType,
    loadFn: (input: NgComponentDefine) => void,
  ) {
    if (isComponentType(type)) {
      loadFn({ component: type });
      return;
    }
    if (typeof type === 'function' || isLazyMark(type)) {
      this.#task.run(() =>
        getLazyImport<() => Promise<any>>(type)!()
          .then((type) => {
            if (isComponentType(type)) {
              return { component: type };
            }
            return type;
          })
          .then((data) => loadFn(data)),
      );
      return;
    }
    loadFn(type as any);
  }
  createComponent(
    list: DynamicComponentConfig[],
    viewContainerRef: ViewContainerRef,
  ) {
    // 销毁
    this.destroyComponentFn?.();
    this.#viewContainerRef = viewContainerRef;
    // 取消上一级的定义
    this.#eventEmitter = new EventEmitter();
    const componentConfig = list[this.#index];

    this.#loadComponent(componentConfig.type, (componentDefine) => {
      this.#componentConfig = componentConfig;
      this.#inputCache = {
        inputs: computed(() => {
          this.#configUpdate$();
          return this.#componentConfig!.inputs!() ?? EmptyOBJ;
        }),
        attributes: computed(() => {
          this.#configUpdate$();
          return this.#componentConfig!.attributes!() ?? EmptyOBJ;
        }),
        directiveList: this.#componentConfig?.directives?.map(
          (config, index) =>
            config.inputs
              ? computed(() => {
                  this.#configUpdate$();
                  return this.#componentConfig!.directives![index].inputs!();
                })
              : undefined,
        ),
      };
      this.#setComponentCheck(componentConfig);

      const componentInjector = Injector.create({
        providers: [
          { provide: PI_COMPONENT_LIST, useValue: list },
          { provide: PI_COMPONENT_INDEX, useValue: this.#index + 1 },
          { provide: PI_COMPONENT_LIST_LISTEN, useValue: this.#eventEmitter },
        ],
        parent: componentConfig.injector ?? viewContainerRef.injector,
      });
      const COMPONENT_VERSION: number | undefined = (
        componentDefine.component as any
      ).__version;
      const injector = componentDefine.module
        ? createNgModule(componentDefine.module, componentInjector).injector
        : componentInjector;

      const componentRef = createComponent(componentDefine.component, {
        elementInjector: injector,
        environmentInjector: injector.get(EnvironmentInjector),
        bindings: [
          ...createInputsBind(this.#inputCache.inputs),
          ...createOutputsBind(componentConfig.outputs),
        ],
        directives: [
          ...(componentConfig.directives ?? []).map((item, index) => ({
            type: item.type,
            bindings: [
              ...createInputsBind(this.#inputCache.directiveList![index]),
              ...createOutputsBind(item.outputs),
            ],
          })),
          ...(COMPONENT_VERSION === 2
            ? []
            : createAttributesDirective(componentConfig.attributes)),
        ],
      });
      this.fieldComponentInstance = componentRef.instance;
      this.fieldElementRef = componentRef.location;
      this.fieldDirectiveRefList = (componentConfig.directives ?? []).map(
        (item) => componentRef.injector.get(item.type),
      );
      if (COMPONENT_VERSION === 2) {
        const templateRef = (
          componentRef.instance as { templateRef: Signal<TemplateRef<any>> }
        ).templateRef();
        viewContainerRef.createEmbeddedView(templateRef, {
          attributes: componentConfig.attributes,
        });
        this.#app.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();
      } else {
        viewContainerRef.insert(componentRef.hostView);
      }
      this.destroyComponentFn = () => {
        viewContainerRef.clear();
        componentRef.destroy();
        this.#eventEmitter.unsubscribe();
      };
      if (list.length === this.#index + 1) {
        const field = componentInjector.get(PI_VIEW_FIELD_TOKEN)();
        field.hooks?.afterCreateComponent?.(field);
      }
    });
  }

  update(list: DynamicComponentConfig[]) {
    const item = list[this.#index];
    const currentCheckConfig = getComponentCheckConfig(item);
    const isEqual = deepEqual(
      currentCheckConfig,
      this.#componentCheckConfig$$(),
    );
    // this.#componentCheckConfig$$ = computed(() => currentCheckConfig);
    if (isEqual) {
      this.#componentConfig = item;
      this.#configUpdate$.update((a) => a + 1);
      // 相等不处理
      this.#eventEmitter.next(list);
    } else {
      this.createComponent(list, this.#viewContainerRef!);
    }
  }
}
