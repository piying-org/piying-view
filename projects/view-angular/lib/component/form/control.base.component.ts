import { signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export class BaseControl<T = any> implements ControlValueAccessor {
  readonly defaultValue: any = undefined;
  value$ = signal<T>(this.defaultValue ?? (undefined as any));

  protected emitValue?: (value: any) => void;
  registerOnChange(fn: any): void {
    this.emitValue = fn;
  }
  /** 同时发射和value变更 */
  valueChange(value: T) {
    this.emitValue?.(value);
    this.value$.set(value);
  }

  writeValue(obj: any): void {
    this.value$.set(obj ?? undefined);
  }
  #touched?: () => void;
  registerOnTouched(fn: any): void {
    this.#touched = fn;
  }
  touchedChange() {
    this.#touched!();
  }
  valueAndTouchedChange(value: T) {
    this.valueChange(value);
    this.touchedChange();
  }
  disabled$ = signal(false);
  setDisabledState(isDisabled: boolean): void {
    this.disabled$.set(isDisabled);
  }
}
