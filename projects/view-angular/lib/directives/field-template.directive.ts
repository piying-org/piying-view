import {
  effect,
  inject,
  Injector,
  ViewContainerRef,
  Directive,
  input,
  untracked,
  computed,
} from '@angular/core';

import {
  PI_VIEW_FIELD_TEMPLATE_REF_TOKEN,
  PiResolvedViewFieldConfig,
} from '../type';
import { KeyPath } from '@piying/view-angular-core';

@Directive({
  selector: '[fieldTemplate]',
  standalone: true,
})
export class PiyingFieldDirective {
  readonly fieldTemplate = input.required<PiResolvedViewFieldConfig>();
  readonly keyPath = input<KeyPath>();
  readonly #viewContainerRef = inject(ViewContainerRef);
  #fieldTemplateRef = inject(PI_VIEW_FIELD_TEMPLATE_REF_TOKEN);

  injector = inject(Injector);
  field$$ = computed(() => {
    const keyPath = this.keyPath();
    return keyPath ? this.fieldTemplate().get(keyPath) : this.fieldTemplate()!;
  });

  constructor() {
    effect((fn) => {
      const targetField = this.field$$();
      untracked(() => {
        fn(() => {
          this.#viewContainerRef.clear();
        });
        this.#viewContainerRef.createEmbeddedView(this.#fieldTemplateRef, {
          $implicit: targetField,
          injector: this.injector,
        });
      });
    });
  }
}
