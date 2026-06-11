import { computed, signal, untracked } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { FieldGroupbase } from './field-group-base';
import { ValueType } from './type';

export class FieldGroup<
  TControl extends { [K in keyof TControl]: AbstractControl<any> } = any,
> extends FieldGroupbase {
  override originValue$$ = computed<any>(() => {
    if (this.updateOn$$() === 'submit') {
      this.submitIndex$();
      return untracked(() => this.getValueByType(ValueType.valid));
    }
    return this.getValueByType(ValueType.valid);
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
  override children$$ = computed(() => this.#controls$$());
  override *activatedChildren() {
    const children = this.children$$();
    for (const key in children) {
      yield [key, children[key]] as [string, AbstractControl];
    }
  }

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

  getValueByType(mode = ValueType.allPartialValid) {
    let result: Record<string, any> = {};
    if (mode === ValueType.allPartialValid) {
      result = this._reduceChildren(
        { ...this.resetValue$() },
        (acc, control, key) => {
          if (!control.isOptionalEmpty()) {
            acc[key] = control.getRawValue(mode);
          }
          return acc;
        },
      );
    } else if (mode === ValueType.valid) {
      result = this._reduceChildren(
        { ...this.resetValue$() },
        (acc, control, key) => {
          if (
            control &&
            control.shouldInclude$$() &&
            !control.isOptionalEmpty()
          ) {
            acc[key] = control.value;
          }
          return acc;
        },
      );
    } else if (mode === ValueType.partialValid) {
      result = this._reduceChildren(
        { ...this.resetValue$() },
        (acc, control, key) => {
          if (
            control &&
            control.shouldEmitValue$$() &&
            !control.isOptionalEmpty()
          ) {
            acc[key] = control.getRawValue(mode);
          }
          return acc;
        },
      );
    }

    result = { ...result, ...(this.resetValue$() ?? {}) };
    return this.transformToModel(
      Object.keys(result).length ? result : this.emptyValue$$(),
      this,
    );
  }
  override getRawValue(mode: ValueType = ValueType.allPartialValid) {
    const value = this.getValueByType(mode);
    const result = this.schemaCheck2$$(value);
    return result.output;
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
}
