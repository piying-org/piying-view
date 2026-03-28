import { Component, computed, inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'selectorless-wrapper',
  template: `<ng-content></ng-content>`,
  standalone: true,
  providers: [],
})
export class ChangeInputWrapper {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  constructor() {
    this.field$$().inputs.update((data) => ({
      ...data,
      input1: '123',
    }));
  }
}
