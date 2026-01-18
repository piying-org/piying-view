import {
  computed,
  Directive,
  inject,
  Injector,
  input,
  TemplateRef,
} from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '../../type';

@Directive()
export class PiyingViewGroupBase {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  children$$ = computed(() => this.field$$().children!());
  fixedChildren$$ = computed(() => this.field$$().fixedChildren?.() ?? []);
  restChildren$$ = computed(() => this.field$$().restChildren?.() ?? []);
  fieldTemplateRef = input.required<TemplateRef<any>>();
  injector = inject(Injector);
}
