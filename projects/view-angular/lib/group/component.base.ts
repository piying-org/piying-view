import { Directive, inject, input, TemplateRef } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '../type';

@Directive()
export class PiyingViewGroupBase {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);

  fieldTemplateRef = input.required<TemplateRef<any>>();
}
