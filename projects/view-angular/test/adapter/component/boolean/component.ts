import { Component, forwardRef } from '@angular/core';
import { BaseControl } from '../../../../lib/component/form/control.base.component';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-boolean',
  templateUrl: './component.html',
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooleanComponent),
      multi: true,
    },
  ],
})
export class BooleanComponent extends BaseControl {}
