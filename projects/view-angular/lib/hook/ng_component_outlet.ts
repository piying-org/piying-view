import { computed, Directive, Injector, input } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../type';

import { DynamicCreateDirective } from './dynamic-create';

@Directive({
  selector: '[ngComponentOutlet]',
  standalone: true,
})
export class NgComponentOutlet<T = any> extends DynamicCreateDirective {
  /** 输入 */
  ngComponentOutlet = input.required<PiResolvedViewFieldConfig>();
  ngComponentOutletInjector = input.required<Injector>();
  override field = computed(() => this.ngComponentOutlet());
  override inputInjector = computed(() => this.ngComponentOutletInjector());
}
