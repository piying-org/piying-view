import { computed, Directive, inject, input, Provider } from '@angular/core';

import { NgControl } from '@angular/forms';
import {
  _PiResolvedCommonViewFieldConfig,
  isFieldControl,
  KeyPath,
} from '@piying/view-angular-core';
import { FieldControlBase } from './field-control-base';

const formControlBinding: Provider = {
  provide: NgControl,
  useFactory: () => inject(PiyingFieldControlBindDirective).ngControl,
};
// 必须这么起名来模拟动态绑定,否则的话定义会被覆盖
@Directive({
  selector: '[formControl]',
  providers: [formControlBinding],
  standalone: true,
  exportAs: 'formControl',
})
export class PiyingFieldControlBindDirective extends FieldControlBase {
  formControl = input.required<_PiResolvedCommonViewFieldConfig>();
  keyPath = input<KeyPath>();
  field$$ = computed(() => {
    const keyPath = this.keyPath();
    return keyPath ? this.formControl().get(keyPath) : this.formControl();
  });
  override fieldControl$$ = computed(() => {
    const control = this.field$$()?.form.control;
    if (!control) {
      throw new Error(
        `📍 fieldControlBind:[${this.field$$()?.keyPath || ''}]->[${this.keyPath() || ''}]❗`,
      );
    }
    if (!isFieldControl(control)) {
      throw new Error(`🏷️ fieldControl❗`);
    }
    return control;
  });
}
