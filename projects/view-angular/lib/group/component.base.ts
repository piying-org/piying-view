import { Directive, input, TemplateRef } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../type/group';

@Directive()
export class PiyingViewGroupBase {
  fields = input.required<PiResolvedViewFieldConfig[]>();
  restFields = input<PiResolvedViewFieldConfig[]>();
  fieldTemplateRef = input.required<TemplateRef<any>>();
}
