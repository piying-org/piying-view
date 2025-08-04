import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  output,
  Signal,
  signal,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PiResolvedViewFieldConfig } from '@piying/view-angular';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  standalone: false,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: Test2Component },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Test2Component implements ControlValueAccessor {
  // 理论上不应该放到自定义控件中,但是为了测试
  field = inject(PI_VIEW_FIELD_TOKEN);
  input1 = input();
  output1 = output<string>();
  value = signal('');
  @Output() output2 = new EventEmitter<string>();
  output3 = output<Signal<PiResolvedViewFieldConfig>>();
  constructor() {}
  ngOnInit(): void {
    this.output3.emit(this.field);
  }
  writeValue(obj: any): void {
    this.value.set(obj ?? '');
  }
  fn: any;
  registerOnChange(fn: any): void {
    this.fn = fn;
  }
  registerOnTouched(fn: any): void {}
  valueChange(value: string) {
    this.output1.emit(value);
    this.output2.emit(value);
    this.fn(value);
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {}
  disabled$ = signal(false);
  setDisabledState(isDisabled: boolean): void {
    this.disabled$.set(isDisabled);
  }
}
