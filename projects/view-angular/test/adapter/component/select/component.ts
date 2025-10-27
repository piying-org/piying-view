import { Component, forwardRef, input } from '@angular/core';
import { BaseControl } from '../../../../lib/component/form/control.base.component';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './component.html',
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent extends BaseControl {
  options = input<{ label: string; value: string }[]>();
}
