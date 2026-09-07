import { inject, Injector, Directive, input, computed } from '@angular/core';

import { PiResolvedViewFieldConfig } from '../type';
import { errorSummary, KeyPath } from '@piying/view-angular-core';
import { DynamicCreateDirective } from '../hook/dynamic-create';

@Directive({
  selector: '[fieldTemplate]',
  standalone: true,
  exportAs: 'fieldTemplate',
})
export class PiyingFieldTemplateDirective extends DynamicCreateDirective {
  readonly fieldTemplate = input.required<PiResolvedViewFieldConfig>();
  readonly path = input<KeyPath>();
  onInit = input<(field: PiResolvedViewFieldConfig) => void>();
  injector = inject(Injector);
  field$$ = computed<PiResolvedViewFieldConfig | undefined>(() => {
    const keyPath = this.path();
    return keyPath ? this.fieldTemplate().get(keyPath) : this.fieldTemplate()!;
  });
  override field = computed(() => this.field$$()!);
  override inputInjector = computed(() => this.injector);

  #initialized = false;
  summaryList$$ = computed(() => {
    return errorSummary(this.field$$()?.form.control);
  });
  valibotIssueSummary$$ = computed(() => {
    return this.summaryList$$()
      .map((item) => item.valibotIssueSummary!)
      .filter(Boolean)
      .join('\n');
  });
  override ngOnChanges(): void {
    let field;
    if (!this.#initialized && (field = this.field$$())) {
      this.#initialized = true;
      this.onInit()?.(field);
    }
    super.ngOnChanges();
  }
}
