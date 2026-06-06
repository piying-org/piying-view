import { computed, Directive, inject, input, Provider } from '@angular/core';

import { NgControl } from '@angular/forms';
import { FieldControl } from '@piying/view-angular-core';
import { FieldControlBase } from './field-control-base';

const formControlBinding: Provider = {
  provide: NgControl,
  useFactory: () => inject(FieldControlDirective).ngControl,
};

@Directive({
  selector: '[fieldControl]',
  providers: [formControlBinding],
  standalone: true,
})
export class FieldControlDirective extends FieldControlBase {
  fieldControl = input.required<FieldControl>();
  override fieldControl$$ = computed(() => this.fieldControl());
}
