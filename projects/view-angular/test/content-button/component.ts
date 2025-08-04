import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'content-button',
  templateUrl: './component.html',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ContentButtonComponent,
    },
  ],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentButtonComponent implements ControlValueAccessor {
  // 理论上不应该放到自定义控件中,但是为了测试
  field = inject(PI_VIEW_FIELD_TOKEN);

  value = signal('');

  constructor() {}
  ngOnInit(): void {}
  writeValue(obj: any): void {
    this.value.set(obj ?? '');
  }
  fn: any;
  registerOnChange(fn: any): void {
    this.fn = fn;
  }
  registerOnTouched(fn: any): void {}
  valueChange(value: string) {
    this.fn(value);
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {}
  disabled$ = signal(false);
  setDisabledState(isDisabled: boolean): void {
    this.disabled$.set(isDisabled);
  }
}
