import {
  ChangeDetectionStrategy,
  Component,
  output,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: `
    button[mat-button], button[mat-raised-button], button[mat-flat-button],
    button[mat-stroked-button]
  `,
  templateUrl: './component.html',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: TestAttrComponent },
  ],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestAttrComponent implements ControlValueAccessor {
  output1 = output<true>();
  constructor() {}
  ngOnInit(): void {
    this.output1.emit(true);
  }
  writeValue(obj: any): void {}
  fn: any;
  registerOnChange(fn: any): void {
    this.fn = fn;
  }
  registerOnTouched(fn: any): void {}
  valueChange(value: string) {}
  ngOnChanges(changes: SimpleChanges): void {}
}
