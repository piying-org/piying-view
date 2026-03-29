import {
  computed,
  Directive,
  inject,
  Injector,
} from '@angular/core';
import {
  PI_VIEW_FIELD_TEMPLATE_REF_TOKEN,
  PI_VIEW_FIELD_TOKEN,
} from '../../type';

@Directive()
export class PiyingViewGroupBase {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  children$$ = computed(() => this.field$$().children!());
  fixedChildren$$ = computed(() => this.field$$().fixedChildren?.() ?? []);
  restChildren$$ = computed(() => this.field$$().restChildren?.() ?? []);
  fieldTemplateRef = inject(PI_VIEW_FIELD_TEMPLATE_REF_TOKEN);
  injector = inject(Injector);
}
