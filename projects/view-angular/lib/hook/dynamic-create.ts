import {
  computed,
  Directive,
  effect,
  inject,
  Injector,
  Signal,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { PiResolvedViewFieldConfig } from '../type';
import { DynamicComponentConfig } from '../type/component';
import { BaseComponent } from '../component/base.component';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { asyncObjectSignal } from '@piying/view-angular-core';
import { FieldControlDirective } from '../directives/field-control.directive';
import { ChainedInjector } from './chained_injector';

@Directive({})
export abstract class DynamicCreateDirective extends BaseComponent {
  abstract field: Signal<PiResolvedViewFieldConfig>;
  abstract inputInjector: Signal<Injector>;
  override index = 0;

  #define = computed(() => this.field().define?.());
  #wrappers = computed(() => this.field().wrappers());
  #directives = computed(() => this.field().directives?.() ?? []);
  #viewContainerRef = inject(ViewContainerRef);
  #injector$$ = computed(
    () => new ChainedInjector(this.field().injector, this.inputInjector()),
  );
  /** 控件用 */
  #ngComponentOutletFormControl$ = computed(() => {
    const field = this.field();
    return field.fixedChildren || field.restChildren
      ? undefined
      : this.field().form.control;
  });
  #formControlDirectiveConfig$$ = computed(() => {
    const fieldControl = this.#ngComponentOutletFormControl$();
    return fieldControl
      ? ({
          type: FieldControlDirective,
          inputs: asyncObjectSignal({ fieldControl: fieldControl }),
        } as DirectiveConfig)
      : undefined;
  });
  #directiveConfigList$$ = computed(() => {
    const directivesInputs = this.#directives();
    const formConfig = this.#formControlDirectiveConfig$$();
    return formConfig ? [...directivesInputs, formConfig] : directivesInputs;
  });
  #componentConfig$$ = computed(() => {
    const define = this.#define();
    const directives = this.#directiveConfigList$$();
    return {
      ...define!,
      directives: directives,
    } as DynamicComponentConfig;
  });
  #componentList$$ = computed(() => {
    const componentConfig = this.#componentConfig$$();
    const list = [
      ...(this.#wrappers() ?? []),
      componentConfig,
    ] as DynamicComponentConfig[];
    list[0].injector = this.#injector$$();
    return list;
  });

  #lastList?: DynamicComponentConfig[];
  #updateFn = computed(() => {
    const list = this.#componentList$$();
    const field = this.field();
    untracked(() => {
      if (!this.#lastList) {
        field.hooks?.beforeCreateComponent?.(field);
        this.createComponent(list, this.#viewContainerRef);
      } else if (this.#lastList !== list) {
        this.update(list);
      }
      this.#lastList = list;
    });
  });
  constructor() {
    super();
    effect(() => {
      this.#updateFn();
    });
  }
  ngOnChanges() {
    this.#updateFn();
  }

  ngOnDestroy() {
    this.destroyComponentFn?.();
  }
}
