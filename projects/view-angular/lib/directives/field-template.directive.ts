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

  injector = inject(Injector);
  field$$ = computed<PiResolvedViewFieldConfig | undefined>(() => {
    const keyPath = this.path();
    return keyPath ? this.fieldTemplate().get(keyPath) : this.fieldTemplate()!;
  });
  override field = computed(() => this.field$$()!);
  override inputInjector = computed(() => this.injector);

  summaryList$$ = computed(() => {
    return errorSummary(this.field$$()?.form.control);
  });
  valibotIssueSummary$$ = computed(() => {
    return this.summaryList$$()
      .map((item) => item.valibotIssueSummary!)
      .filter(Boolean)
      .join('\n');
  });
}
