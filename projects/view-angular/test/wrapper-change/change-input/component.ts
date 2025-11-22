import { Component } from '@angular/core';
import { PiyingViewWrapperBase } from '@piying/view-angular';

@Component({
  selector: 'selectorless-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  standalone: true,
  providers: [],
  imports: [],
})
export class ChangeInputWrapper extends PiyingViewWrapperBase {
  constructor() {
    super();
    this.field$$().inputs.update((data) => ({
      ...data,
      input1: '123',
    }));
  }
}
