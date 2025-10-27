import { Component, forwardRef, input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'app-update1',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Update1Component),
      multi: true,
    },
  ],
  host:{
    '[class]':'input1()'
  }
})
export class Update1Component extends BaseControl {
  input1 = input();
}
