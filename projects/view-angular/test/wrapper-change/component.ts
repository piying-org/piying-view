import { Component, input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewWrapperBase } from '@piying/view-angular';

@Component({
  selector: 'comp1',
  template: '',
  standalone: true,
  providers: [],
  imports: [FormsModule],
})
export class WrapperChange {
  input1 = input('333');
  input2 = input();
}
