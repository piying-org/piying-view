import { Directive, inject, input } from '@angular/core';
import { PI_VIEW_COMPONENT_LIST_TOKEN } from '../../../lib/type';
import {
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';

@Directive({
  selector: '[matFormControlBind]',
})
export class MatFormControlBindDirective {
  matFormControlBind = input<MatFormField>();
  #list = inject(PI_VIEW_COMPONENT_LIST_TOKEN);

  ngOnChanges(): void {
    const item = this.#list[this.#list.length - 1];
    this.matFormControlBind()!._control =
      item.injector.get(MatFormFieldControl);
  }
}
