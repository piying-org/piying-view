import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { isFieldLogicGroup } from './is-field';
import { FieldGroupbase } from './field-group-base';

export class FieldGroup<
  TControl extends { [K in keyof TControl]: AbstractControl<any> } = any,
> extends FieldGroupbase {
  override value$$ = computed<any>(() => {
    const result = this._reduceChildren(
      { ...this.#looseValue$$() },
      (acc, control, name) => {
        if (control.shouldInclude$$()) {
          acc[name] = control.value;
        }
        return acc;
      },
    );
    const returnResult = Object.keys(result).length
      ? result
      : this.emptyValue$$();
    return (
      this.config$().transfomer?.toModel?.(returnResult, this) ?? returnResult
    );
  });
  #controls$$ = computed(() => ({
    ...this.fixedControls$(),
    ...this.resetControls$(),
  }));

  fixedControls$ = signal<Record<string, AbstractControl>>({});
  resetControls$ = signal<Record<string, AbstractControl>>({});

  get controls() {
    return this.#controls$$();
  }
  override children$$ = computed(() => Object.values(this.#controls$$()));

  removeRestControl(key: string): void {
    if (!this.resetControls$()[key]) {
      return;
    }
    this.resetControls$.update((controls) => {
      controls = { ...controls };
      delete controls[key];
      return controls;
    });
  }

  override setControl(key: string, control: AbstractControl): void {
    const controls$ = this.inited ? this.resetControls$ : this.fixedControls$;
    controls$.update((controls) => ({ ...controls, [key]: control }));
    control.setParent(this);
  }

  override getRawValue() {
    return this._reduceChildren({}, (acc, control, key) => {
      acc[key] = control.getRawValue();
      return acc;
    });
  }
  clear(): void {
    if (Object.keys(this.resetControls$()).length < 1) return;
    this.beforeUpdateList.forEach((fn) => fn({}, false));
  }

  /** @internal */
  override _forEachChild(cb: (c: AbstractControl, key: any) => void): void {
    const controls = this.#controls$$();
    Object.keys(controls).forEach((key) => {
      cb(controls[key], key);
    });
  }

  override find(key: string): AbstractControl | null {
    return this.#controls$$()[key];
  }

  override getResetValue(inputValue: any) {
    const controls = this.fixedControls$();
    return inputValue
      ? Object.keys(inputValue).reduce(
          (obj, key) => {
            if (!(key in controls)) {
              obj[key] = inputValue[key];
            }
            return obj;
          },
          {} as Record<string, any>,
        )
      : {};
  }
  #looseValue$$ = computed(() => {
    const resetValue = this.resetValue$();
    if (!resetValue || isFieldLogicGroup(this.parent)) {
      return undefined;
    }
    return resetValue;
  });
}
