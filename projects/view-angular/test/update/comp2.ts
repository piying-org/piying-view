import { Component, forwardRef, input, OnInit } from '@angular/core';
import { BaseControl } from '../../lib/component/form/control.base.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-update2',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Update2Component),
      multi: true,
    },
  ],
  host: {
    '[class]': 'input2()',
  },
})
export class Update2Component extends BaseControl {
  input2 = input();
}
