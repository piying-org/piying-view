import {
  ApplicationRef,
  ComponentRef,
  computed,
  createComponent,
  createNgModule,
  Directive,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  inputBinding,
  NgModuleRef,
  outputBinding,
  PendingTasks,
  reflectComponentType,
  signal,
  Signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  PiResolvedViewFieldConfig,
  ComponentRawType,
  NgDirectiveConfig,
  PI_VIEW_COMPONENT_LIST_TOKEN,
} from '../type';
import { ComponentVersion, DynamicComponentConfig, NgComponentDefine } from '../type/component';
import { isComponentType } from '../util/async-cache';
import {
  asyncObjectSignal,
  getLazyImport,
  isLazyMark,
  ViewAttributes,
  ViewEvents,
  ViewInputs,
  ViewOutputs,
} from '@piying/view-angular-core';

import { AttributesDirective } from './attributes.directive';
import { EventsDirective } from './events.directive';
import { FieldControlDirective } from './field-control-directive';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { ChainedInjector } from '../hook/chained_injector';
function createInputsBind(inputs?: Signal<ViewInputs | undefined>) {
  if (!inputs?.()) {
    return [];
  }
  return Object.keys(inputs()!).map((key) =>
    inputBinding(
      key,
      computed(() => inputs()![key]),
    ),
  );
}
function createOutputsBind(outputs?: Signal<ViewOutputs>) {
  if (!outputs?.()) {
    return [];
  }
  return Object.keys(outputs!()!).map((key) =>
    outputBinding(key, (event) => outputs!()![key](event)),
  );
}
function createAttributesDirective(
  attributes: Signal<ViewAttributes | undefined>,
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
function createEventsDirective(events: Signal<ViewEvents | undefined>) {
  if (events()) {
    return [
      {
        type: EventsDirective,
        bindings: [inputBinding('events', events)],
      },
    ];
  }
  return [];
}
// 没有保存
@Directive({
  selector: '[fieldOutlet]',
  standalone: true,
})
export class FieldOutlet {
  fieldOutlet = input.required<PiResolvedViewFieldConfig>();
  nextTemplateRef = input.required<
    TemplateRef<{
      injector: Signal<Injector | undefined>;
      index: number;
      fieldConfig: PiResolvedViewFieldConfig;
    }>
  >();
  index = input(0);
  injector = input.required<Injector>();
  listen = input<any>();
  #isGroup$$ = computed(() => {
    const define = this.fieldOutlet();
    return define?.fixedChildren || define?.restChildren;
  });
  #control = computed(() => this.fieldOutlet().form.control);
  #formControlDirectiveConfig$$ = computed(() => {
    const isGroup = this.#isGroup$$();
    return !isGroup && this.#control()
      ? ({
          type: FieldControlDirective,
          inputs: asyncObjectSignal({ fieldControl: this.#control() }),
        } as DirectiveConfig)
      : undefined;
  });
  /* 组件的指令 **/
  #directiveConfigList$$ = computed(() => {
    const directivesInputs = this.fieldOutlet().directives!() ?? [];
    const formConfig = this.#formControlDirectiveConfig$$();
    return formConfig ? [...directivesInputs, formConfig] : directivesInputs;
  });

  #wrappers = computed(() => this.fieldOutlet().wrappers());

  #viewRef = inject(ViewContainerRef);
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
  #moduleRef: NgModuleRef<any> | undefined;
  #injector$$ = computed(
    () => new ChainedInjector(this.fieldOutlet().injector, this.injector()),
  );
  #componentRef: ComponentRef<any> | undefined;
  #app = inject(ApplicationRef);
  ngOnChanges(): void {
    this.#createComponent();
  }
  #createComponent() {
    this.#dispose();
    const injector = this.#injector$$();
    const evInjector = injector.get(EnvironmentInjector);

    const index = this.index();
    /** 用于wrapper的槽传递 */
    const templateRef = this.nextTemplateRef();
    let createProjectableNodes: (
      componentDefine: NgComponentDefine,
    ) => Node[][];
    let typeDefine = this.#wrappers()[index] as DynamicComponentConfig;
    const cmpInjector = signal<Injector | undefined>(undefined);
    let directivesList!: NgDirectiveConfig[];
    // 改增量后,要保证列表更新时没有问题
    const componentList = injector.get(PI_VIEW_COMPONENT_LIST_TOKEN);

    /** 包装器 */
    if (typeDefine) {
      const embRef = this.#viewRef.createEmbeddedView(templateRef, {
        injector: cmpInjector,
        index: index + 1,
        fieldConfig: this.fieldOutlet(),
      });
      createProjectableNodes = () => [embRef.rootNodes];
      directivesList = [];
    } else {
      /** 内层组件 */
      typeDefine = this.fieldOutlet().define!() as any;
      createProjectableNodes = (componentDefine) => {
        const cm = reflectComponentType(componentDefine.component)!;
        const templateSlots = typeDefine.slots!();
        const templateRefList = cm.ngContentSelectors.map(
          (key) => templateSlots[key] as TemplateRef<any> | undefined,
        );
        const viewRefList = templateRefList.map((item) =>
          item ? this.#viewRef.createEmbeddedView(item) : undefined,
        );
        return viewRefList.map((item) => item?.rootNodes ?? []);
      };
      directivesList = this.#directiveConfigList$$();
    }
    this.#loadComponent(typeDefine.type, (componentDefine) => {
      const COMPONENT_VERSION: number | undefined = (
        componentDefine.component as ComponentVersion
      ).__version;
      this.#moduleRef = componentDefine.module
        ? createNgModule(componentDefine.module, injector)
        : undefined;
      const evInjector2 = this.#moduleRef?.injector ?? evInjector;
      const componentRef = createComponent(componentDefine.component, {
        elementInjector: injector,
        environmentInjector: evInjector2,

        bindings: [
          ...createInputsBind(typeDefine.inputs),
          ...createOutputsBind(typeDefine.outputs),
        ],
        directives: [
          ...directivesList.map((item) => ({
            type: item.type,
            bindings: [
              ...createInputsBind(item.inputs),
              ...createOutputsBind(item.outputs),
            ],
          })),
          ...(COMPONENT_VERSION === 2
            ? []
            : [
                ...createAttributesDirective(typeDefine.attributes),
                ...createEventsDirective(typeDefine.events),
              ]),
        ],
        projectableNodes: createProjectableNodes(componentDefine),
      });
      this.#componentRef = componentRef;
      componentList.push(componentRef);
      if (COMPONENT_VERSION === 2) {
        const templateRef = (
          componentRef.instance as { templateRef: Signal<TemplateRef<any>> }
        ).templateRef();
        this.#viewRef.createEmbeddedView(templateRef, {
          attributes: typeDefine.attributes,
          events: typeDefine.events,
        });
        this.#app.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();
      } else {
        this.#viewRef.insert(componentRef.hostView);
      }

      cmpInjector.set(componentRef.injector);
    });
  }
  #dispose() {
    this.#viewRef.clear();
    this.#componentRef?.destroy();
    this.#componentRef = undefined;
    this.#moduleRef?.destroy();
    this.#moduleRef = undefined;
  }
  ngOnDestroy(): void {
    this.#dispose();
  }
}
