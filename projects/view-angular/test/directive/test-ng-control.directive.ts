import { Directive, inject, output } from '@angular/core';
import { FieldControlDirective } from '../../lib/directives/field-control-directive';

@Directive({
  selector: '[testNgControl]',
})
export class TestNgControlDirective {
  control = inject(FieldControlDirective);
  dataChange = output<any>();
  constructor() {
    Promise.resolve().then(() => {
      this.test();
    });
  }
  test() {
    this.dataChange.emit(this.control.ngControl);
  }
}
