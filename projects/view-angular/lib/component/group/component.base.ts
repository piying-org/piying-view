import { computed, Directive, inject, Injector } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN, PI_VIEW_TEMPLATE_REF_TOKEN } from '../../type';

@Directive()
export class PiyingViewGroupBase {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  children$$ = computed(() => this.field$$().children!());
  fixedChildren$$ = computed(() => this.field$$().fixedChildren?.() ?? []);
  restChildren$$ = computed(() => this.field$$().restChildren?.() ?? []);
  fieldTemplateRef = (() => {
    const a = inject(PI_VIEW_TEMPLATE_REF_TOKEN);
    return () => a;
  })();

  injector = inject(Injector);
}
