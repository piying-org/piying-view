import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';
import { isFieldLogicGroup } from './is-field';
import { UpdateType } from './type';

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
  override children$$ = computed(() => [
    ...Object.values(this.fixedControls$()),
    ...Object.values(this.resetControls$()),
  ]);

  fixedControls$ = signal<Record<string, AbstractControl>>({});
  resetControls$ = signal<Record<string, AbstractControl>>({});
  beforeUpdateList: ((
    value: Record<string, any>,
    initValue: boolean,
  ) => void)[] = [];

  #controls$$ = computed(() => ({
    ...this.fixedControls$(),
    ...this.resetControls$(),
  }));
  get controls() {
    return this.#controls$$();
  }

  removeRestControl(name: string): void {
    if (this.resetControls$()[name]) {
      this.resetControls$.update((controls) => {
        controls = { ...controls };
        delete controls[name];
        return controls;
      });
    }
  }

  override setControl(name: string, control: AbstractControl): void {
    const control$ = this.#inited ? this.resetControls$ : this.fixedControls$;
    control$.update((controls) => ({ ...controls, [name]: control }));
    control.setParent(this);
  }

  override reset(value?: any): void {
    const initValue = this.getInitValue(value);
    this.#updateValue(initValue, UpdateType.reset);
  }

  override getRawValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      (acc as any)[name] = control.getRawValue();
      return acc;
    }) as any;
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
    return this.#controls$$()[name];
  }
  looseValue$$ = computed(() => {
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
    } else if (
      type === UpdateType.init
        ? this.config$().groupMode === 'loose'
        : this.config$().groupMode === 'default' ||
          this.config$().groupMode === 'loose'
    ) {
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
  #inited = false;
  initedValue: any;
  override updateInitValue(value: any): void {
    this.#inited = true;
    const initValue = this.getInitValue(value);
    this.#updateValue(initValue, UpdateType.init);
  }
}
