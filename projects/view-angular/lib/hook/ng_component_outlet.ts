import {
  computed,
  createNgModule,
  Directive,
  inject,
  Injector,
  input,
  OnChanges,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { PiResolvedViewFieldConfig, NgResolvedWraaperConfig } from '../type';
import {
  DynamicComponentConfig,
  RawDirectiveOutputs,
  NgResolvedComponentDefine2,
} from '../type/component';
import { EMPTY_ARRAY } from '../const';
import { BaseComponent } from '../component/base.component';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { deepEqual } from 'fast-equals';
import { FieldControl } from '@piying/view-angular-core';
import { PI_COMPONENT_INDEX, PI_VIEW_FIELD_TOKEN } from '../type/view-token';
import { FieldControlDirective } from '../directives/field-control-directive';

@Directive({
  selector: '[ngComponentOutlet]',
  standalone: true,
})
export class NgComponentOutlet<T = any>
  extends BaseComponent
  implements OnChanges, OnDestroy
{
  /** 输入 */
  ngComponentOutlet = input<NgResolvedComponentDefine2>();
  ngComponentOutletInputs = input<Record<string, unknown>>();
  ngComponentOutletOutputs = input<RawDirectiveOutputs>();
  /** 控件用 */
  ngComponentOutletFormControl = input<FieldControl>();
  /** 包裹用 */
  ngComponentOutletWrappers = input<NgResolvedWraaperConfig[]>();
  ngComponentOutletDirectives =
    input<PiResolvedViewFieldConfig['directives']>();

  ngComponentOutletField = input.required<PiResolvedViewFieldConfig>();
  #viewContainerRef = inject(ViewContainerRef);
  // 这里感觉会在非发射时出现多次输入?
  #wrappers = computed(() =>
    this.ngComponentOutletWrappers()?.map((item) => ({
      ...item,
      type: item.type.component,
      module: item.type.module,
    })),
  );
  #onputEqual$$ = computed(() => this.ngComponentOutletOutputs(), {
    equal: deepEqual,
  });

  #moduleDestroy?: () => void;

  #moduleRef$$ = computed(() => {
    this.#moduleDestroy?.();
    const module = this.ngComponentOutlet()?.type.module;
    if (!module) {
      return;
    }
    const moduleRef = createNgModule(module, this.#injector);
    this.#moduleDestroy = () => {
      moduleRef.destroy();
      this.#moduleDestroy = undefined;
    };
    return moduleRef;
  });
  #usedEnvInjector$$ = computed(() => {
    const injector = this.#moduleRef$$()?.injector ?? this.#injector;
    return Injector.create({
      providers: [
        {
          provide: PI_VIEW_FIELD_TOKEN,
          useValue: this.ngComponentOutletField,
        },
        {
          provide: PI_COMPONENT_INDEX,
          useValue: 0,
        },
      ],
      parent: injector,
    }).get(Injector);
  });
  #injector = inject(Injector);
  #formControlDirectiveConfig$$ = computed(() => {
    const fieldControl = this.ngComponentOutletFormControl();
    return fieldControl
      ? ({
          type: FieldControlDirective,
          inputs: computed(() => ({ fieldControl: fieldControl })),
        } as DirectiveConfig)
      : undefined;
  });
  #directiveConfigList$$ = computed(() => {
    const directivesInputs = this.ngComponentOutletDirectives();
    const formConfig = this.#formControlDirectiveConfig$$();
    return formConfig
      ? [...(directivesInputs?.() ?? []), formConfig]
      : directivesInputs?.();
  });

  #componentConfig$$ = computed(() => {
    const define = this.ngComponentOutlet();
    if (!define) {
      return;
    }
    const directives = this.#directiveConfigList$$();
    return {
      ...define!,
      type: define!.type.component,
      module: define!.type.module,
      inputs: this.ngComponentOutletInputs,
      directives: directives
        ? directives.map((item) => {
            const outputs = item.outputs;
            if (outputs) {
              return {
                ...item,
                outputs: outputs,
              };
            }
            return item;
          })
        : undefined,
      outputs: this.#onputEqual$$(),
    } as DynamicComponentConfig;
  });
  #componentList$$ = computed(() => {
    const componentConfig = this.#componentConfig$$();
    if (!componentConfig) {
      return EMPTY_ARRAY;
    }
    const injector = this.#usedEnvInjector$$();
    const list: DynamicComponentConfig[] = [
      ...(this.#wrappers() ?? []),
      componentConfig,
    ];

    list[0] = { ...list[0], injector };

    return list;
  });

  #lastList?: DynamicComponentConfig[];
  ngOnChanges() {
    //todo 变更时的一些检测,相同时应该不处理
    const list = this.#componentList$$();
    if (!list.length) {
      return this.destroyComponentFn?.();
    }
    if (!this.#lastList) {
      const field = this.ngComponentOutletField();
      field.hooks?.beforeCreateComponent?.(field);
      this.setFieldData(this.ngComponentOutletField, 0);
      this.createComponent(list, this.#viewContainerRef);
    } else if (this.#lastList !== list) {
      this.update(list);
    }
    // 监听输入/输出变更,重新进行赋值

    this.#lastList = list;
  }

  ngOnDestroy() {
    this.#moduleDestroy?.();
    this.destroyComponentFn?.();
  }
}
