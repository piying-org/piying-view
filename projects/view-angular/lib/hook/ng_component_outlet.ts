import {
  computed,
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
  NgResolvedComponentDefine2,
} from '../type/component';
import { EMPTY_ARRAY } from '../const';
import { BaseComponent } from '../component/base.component';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { asyncObjectSignal, FieldControl } from '@piying/view-angular-core';
import { FieldControlDirective } from '../directives/field-control-directive';
import { ChainedInjector } from './chained_injector';

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
  ngComponentOutletExtraInputs = input<Record<string, unknown>>();
  /** 控件用 */
  ngComponentOutletFormControl = input<FieldControl>();
  /** 包裹用 */
  ngComponentOutletWrappers = input<NgResolvedWraaperConfig[]>();
  ngComponentOutletDirectives =
    input<PiResolvedViewFieldConfig['directives']>();

  ngComponentOutletField = input.required<PiResolvedViewFieldConfig>();
  #viewContainerRef = inject(ViewContainerRef);
  // 这里感觉会在非发射时出现多次输入?

  ngComponentOutletInjector = input.required<Injector>();

  #injector$$ = computed(
    () =>
      new ChainedInjector(
        this.ngComponentOutletField().injector,
        this.ngComponentOutletInjector(),
      ),
  );
  #formControlDirectiveConfig$$ = computed(() => {
    const fieldControl = this.ngComponentOutletFormControl();
    return fieldControl
      ? ({
          type: FieldControlDirective,
          inputs: asyncObjectSignal({ fieldControl: fieldControl }),
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
  #componentInput$$ = computed(() => ({
    ...this.ngComponentOutlet()?.inputs?.(),
    ...this.ngComponentOutletExtraInputs(),
  }));
  #componentConfig$$ = computed(() => {
    const define = this.ngComponentOutlet();
    if (!define) {
      return;
    }
    const directives = this.#directiveConfigList$$();
    return {
      ...define!,
      outputs: define.outputs,
      inputs: this.#componentInput$$,
      directives: directives,
    } as DynamicComponentConfig;
  });
  #componentList$$ = computed(() => {
    const componentConfig = this.#componentConfig$$();
    if (!componentConfig) {
      return EMPTY_ARRAY;
    }
    const list = [
      ...(this.ngComponentOutletWrappers() ?? []),
      componentConfig,
    ] as DynamicComponentConfig[];
    list[0].injector = this.#injector$$();
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
    this.destroyComponentFn?.();
  }
}
