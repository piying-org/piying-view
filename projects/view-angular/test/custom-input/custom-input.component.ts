import { Component } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '../../lib/component/form/control.base.component';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomInputComponent,
    },
  ],
  template: ``,
})
export class CustomInputComponent extends BaseControl<any> {}
