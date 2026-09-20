import { inject, Injector, Directive, input, computed } from '@angular/core';

import { PiResolvedViewFieldConfig } from '../type';
import {
  errorSummary,
  KeyPath,
  PiFieldBindPath,
  PiFieldGet,
} from '@piying/view-angular-core';
import { DynamicCreateDirective } from '../hook/dynamic-create';

@Directive({
  selector: '[fieldTemplate]',
  standalone: true,
  exportAs: 'fieldTemplate',
})
export class PiyingFieldTemplateDirective<
  S = PiResolvedViewFieldConfig,
  P extends KeyPath = [],
> extends DynamicCreateDirective {
  readonly fieldTemplate = input.required<S>();
  readonly path = input<[...P] | PiFieldBindPath<S>>();
  onInit = input<(field: PiResolvedViewFieldConfig) => void>();
  injector = inject(Injector);

  /** 运行时解析结果(宽松类型), 供内部逻辑使用 */
  #resolved = computed<PiResolvedViewFieldConfig | undefined>(() => {
    const base = this.fieldTemplate() as unknown as PiResolvedViewFieldConfig;
    const keyPath = this.path();
    return (keyPath ? base.get(keyPath as KeyPath) : base) as
      | PiResolvedViewFieldConfig
      | undefined;
  });

  field$$ = computed(
    (): PiFieldGet<S, P> | undefined =>
      this.#resolved() as unknown as PiFieldGet<S, P> | undefined,
  );
  override field = computed(() => this.#resolved()!);
  override inputInjector = computed(() => this.injector);

  #initialized = false;
  summaryList$$ = computed(() => errorSummary(this.#resolved()?.form.control));
  valibotIssueSummary$$ = computed(() =>
    this.summaryList$$()
      .map((item) => item.valibotIssueSummary!)
      .filter(Boolean)
      .join('\n'),
  );
  override ngOnChanges(): void {
    let field;
    if (!this.#initialized && (field = this.#resolved())) {
      this.#initialized = true;
      this.onInit()?.(field);
    }
    super.ngOnChanges();
  }
}
