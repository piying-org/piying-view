import { Component, forwardRef, inject } from '@angular/core';
import { BaseControl } from '../form/base.component';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'formly-custom-input-1',
  templateUrl: './component.html',
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormlyCustomInput1Component),
      multi: true,
    },
  ],
})
export default class FormlyCustomInput1Component extends BaseControl {
  field = inject(PI_VIEW_FIELD_TOKEN);
}
