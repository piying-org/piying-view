import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  input,
  Output,
  output,
  Signal,
  signal,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { PiResolvedViewFieldConfig } from '@piying/view-angular';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: Test1Component },
  ],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Test1Component implements ControlValueAccessor {
  // 理论上不应该放到自定义控件中,但是为了测试
  field = inject(PI_VIEW_FIELD_TOKEN);
  input1 = input();
  input2 = input();
  output1 = output<string>();
  value = signal('');
  @Output() output2 = new EventEmitter<string>();
  output3 = output<Signal<PiResolvedViewFieldConfig>>();
  ngControlChange = output<NgControl | undefined>();
  destroyedChange = output<true>();
  injector = inject(Injector);
  constructor() {}
  ngOnInit(): void {
    this.output3.emit(this.field);
    this.ngControlChange.emit(
      this.injector.get(NgControl, undefined, { optional: true }) ?? undefined,
    );
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
    this.value.set(value);
    this.fn(value);
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {
    this.destroyedChange.emit(true);
  }
  disabled$ = signal(false);
  setDisabledState(isDisabled: boolean): void {
    this.disabled$.set(isDisabled);
  }
}
