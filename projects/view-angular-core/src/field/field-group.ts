import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';
import { isFieldLogicGroup } from './is-field';
import { UpdateType } from './type';

export class FieldGroup<
  TControl extends { [K in keyof TControl]: AbstractControl<any> } = any,
> extends AbstractControl {
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
  override children$$ = computed(() => [
    ...Object.values(this.fixedControls$()),
    ...Object.values(this.resetControls$()),
  ]);

  fixedControls$ = signal<Record<string, AbstractControl>>({});
  resetControls$ = signal<Record<string, AbstractControl>>({});

  #controls$$ = computed(() => ({
    ...this.fixedControls$(),
    ...this.resetControls$(),
  }));
  get controls() {
    return this.#controls$$();
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
    const controls$ = this.#inited ? this.resetControls$ : this.fixedControls$;
    controls$.update((controls) => ({ ...controls, [key]: control }));
    control.setParent(this);
  }

  override reset(value?: any): void {
    const initValue = this.getInitValue(value);
    this.#updateValue(initValue, UpdateType.reset);
  }

  override getRawValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      acc[name] = control.getRawValue();
      return acc;
    });
  }
  clear(): void {
    if (Object.keys(this.resetControls$()).length < 1) return;
    this.beforeUpdateList.forEach((fn) => fn({}, false));
  }

  /** @internal */
  override _forEachChild(cb: (v: any, k: any) => void): void {
    const controls = this.#controls$$();
    Object.keys(controls).forEach((key) => {
      cb(controls[key], key);
    });
  }

  /** @internal */
  _reduceChildren(
    initValue: any,
    fn: (acc: any, control: AbstractControl, name: any) => any,
  ): any {
    let res = initValue;
    this._forEachChild((control: AbstractControl, name: any) => {
      res = fn(res, control, name);
    });
    return res;
  }

  override find(key: string): AbstractControl | null {
    return this.#controls$$()[key];
  }
  beforeUpdateList: ((
    value: Record<string, any>,
    initValue: boolean,
  ) => void)[] = [];
  #getResetValue(inputValue: any) {
    const controls = this.fixedControls$();
    return inputValue
      ? Object.keys(inputValue).reduce(
          (obj, item) => {
            if (!(item in controls)) {
              obj[item] = inputValue[item];
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
  resetValue$ = signal<any>(undefined);
  #updateValue(value: any, type: UpdateType) {
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    if (type === UpdateType.init) {
      this.initedValue = viewValue;
    }
    if (this.config$().groupMode === 'reset') {
      const resetObj = this.#getResetValue(viewValue);
      this.beforeUpdateList.forEach((fn) =>
        fn(resetObj, type !== UpdateType.init),
      );
    } else if (this.config$().groupMode === 'loose') {
      const resetObj = this.#getResetValue(viewValue);
      this.resetValue$.set(resetObj);
    }
    this._forEachChild((control, key) => {
      if (type === UpdateType.init) {
        control.updateInitValue(viewValue?.[key]);
      } else if (type === UpdateType.update) {
        control.updateValue(viewValue?.[key]);
      } else {
        control.reset(viewValue ? (viewValue as any)[key] : undefined);
      }
    });
  }
  override updateValue(value: any): void {
    if (deepEqual(value, this.value$$())) {
      return;
    }
    this.#updateValue(value, UpdateType.update);
  }

  #inited = false;
  initedValue: any;
  override updateInitValue(value: any): void {
    this.#inited = true;
    const initValue = this.getInitValue(value);
    this.#updateValue(initValue, UpdateType.init);
  }
}
