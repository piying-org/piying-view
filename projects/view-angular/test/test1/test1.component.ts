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
import { BaseControl, PiResolvedViewFieldConfig } from '@piying/view-angular';
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
export class Test1Component extends BaseControl {
  override defaultValue = '';
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
  ngOnInit(): void {
    this.output3.emit(this.field);
    this.ngControlChange.emit(
      this.injector.get(NgControl, undefined, { optional: true }) ?? undefined,
    );
  }

  valueChange2(value: string) {
    this.output1.emit(value);
    this.output2.emit(value);
    this.value.set(value);
    this.valueChange(value);
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {
    this.destroyedChange.emit(true);
  }
}
