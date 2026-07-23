import {
  inject,
  Injector,
  ViewContainerRef,
  Directive,
  input,
  computed,
} from '@angular/core';

import { PiResolvedViewFieldConfig } from '../type';
import { KeyPath } from '@piying/view-angular-core';
import { DynamicCreateDirective } from '../hook/dynamic-create';

@Directive({
  selector: '[fieldTemplate]',
  standalone: true,
})
export class PiyingFieldTemplateDirective extends DynamicCreateDirective {
  readonly fieldTemplate = input.required<PiResolvedViewFieldConfig>();
  readonly path = input<KeyPath>();

  injector = inject(Injector);
  field$$ = computed(() => {
    const keyPath = this.path();
    return keyPath ? this.fieldTemplate().get(keyPath) : this.fieldTemplate()!;
  });
  override field = computed(() => this.field$$()!);
  override inputInjector = computed(() => this.injector);
}
