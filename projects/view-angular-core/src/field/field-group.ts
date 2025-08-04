import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';
import { isFieldLogicGroup } from './is-field';

export class FieldGroup<
  TControl extends { [K in keyof TControl]: AbstractControl<any> } = any,
> extends AbstractControl {
  override value$$ = computed<any>(() => {
    const acc: Partial<TControl> = {};
    const value = this._reduceChildren(acc, (acc, control, name) => {
      if (control.shouldInclude$$()) {
        acc[name] = control.value;
      }
      return acc;
    });
    const result = { ...value, ...this.looseValue$$() };
    const returnResult = Object.keys(result).length
      ? result
      : this.emptyValue$$();
    return (
      this.config$().transfomer?.toModel?.(returnResult, this) ?? returnResult
    );
  });
  override children$$ = computed(() => Object.values(this.controls$()));

  controls$ = signal<Record<string, AbstractControl>>({});
  get controls() {
    return this.controls$();
  }

  registerControl(name: string, control: AbstractControl) {
    if (this.controls$()[name]) return this.controls$()[name];
    this.controls$.update((controls) => ({ ...controls, [name]: control }));
    control.setParent(this);
    return control;
  }

  removeControl(name: string): void {
    if (this.controls$()[name]) {
      this.controls$.update((controls) => {
        controls = { ...controls };
        delete controls[name];
        return controls;
      });
    }
  }

  override setControl(name: string, control: AbstractControl): void {
    this.controls$.update((controls) => {
      controls = { ...controls };
      delete controls[name];
      return controls;
    });
    if (control) this.registerControl(name, control);
  }

  override reset(value: any = {}): void {
    this._forEachChild((control: AbstractControl, name) => {
      control.reset(value ? (value as any)[name] : undefined);
    });
  }

  override getRawValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      (acc as any)[name] = control.getRawValue();
      return acc;
    }) as any;
  }

  /** @internal */
  override _forEachChild(cb: (v: any, k: any) => void): void {
    Object.keys(this.controls$()).forEach((key) => {
      const control = this.controls$()[key];
      control && cb(control, key);
    });
  }

  /** @internal */
  _reduceChildren<T, K extends keyof TControl>(
    initValue: T,
    fn: (acc: T, control: TControl[K], name: K) => T,
  ): T {
    let res = initValue;
    this._forEachChild((control: TControl[K], name: K) => {
      res = fn(res, control, name);
    });
    return res;
  }

  override find(name: string): AbstractControl | null {
    return this.controls$()[name];
  }
  looseValue$$ = computed(() => {
    const resetValue = this.#inputValue$();
    if (!resetValue || isFieldLogicGroup(this.parent)) {
      return {};
    }
    const controls = this.controls$();
    const looseValue = {} as any;
    for (const key in resetValue) {
      if (!(key in controls)) {
        looseValue[key] = resetValue[key];
      }
    }
    return looseValue;
  });
  /**
   * loose object
   * todo 动态添加
   *  */
  #inputValue$ = signal({} as Record<string, any>);
  #setInputValue(obj: any) {
    this.#inputValue$.set(obj);
  }
  override updateValue(value: any): void {
    if (deepEqual(value, this.value$$())) {
      return;
    }
    if (!deepEqual(value, this.#inputValue$())) {
      this.#setInputValue(value);
    }
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;

    for (const key in this.controls$()) {
      const control = this.controls$()[key];
      control.updateValue(viewValue?.[key]);
    }
  }
}
