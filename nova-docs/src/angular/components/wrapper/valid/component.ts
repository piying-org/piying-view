import { Component, computed, inject } from '@angular/core';
import {
  InsertFieldDirective,
  PI_VIEW_FIELD_TOKEN,
} from '@piying/view-angular';
import {
  fieldControlStatusClass,
  getDeepError,
} from '@piying/view-angular-core';

@Component({
  selector: 'valid-wrapper',
  templateUrl: './component.html',
  imports: [InsertFieldDirective],
})
export class ValidWC {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  errorStr$$ = computed(() => {
    const field = this.field$$();
    const list = getDeepError(field.form.control);

    return list.map((item) => item.valibotIssueSummary).join('\n');
  });
  classStatus$$ = computed(() =>
    fieldControlStatusClass(this.field$$().form.control),
  );
  isChangedStatus$$ = computed(
    () =>
      this.field$$().form.control?.dirty$$() ||
      this.field$$().form.control?.touched$$(),
  );
}
