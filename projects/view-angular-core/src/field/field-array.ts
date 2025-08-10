import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';

export class FieldArray<
  TControl extends AbstractControl<any> = any,
> extends AbstractControl {
  #deletionMode$$ = computed(() => this.config$().deletionMode ?? 'shrink');
  override value$$ = computed<any>(() => {
    const list: any[] = [];
    this._reduceChildren(list, (acc, control, name) => {
      if (control && control.shouldInclude$$()) {
        list.push(control.value$$());
      } else {
        if (this.#deletionMode$$() === 'shrink') {
          return list;
        } else if (this.#deletionMode$$() === 'mark') {
          list.push(undefined);
        }
      }
      return list;
    });

    const returnResult = list.length === 0 ? this.emptyValue$$() : list;
    return (
      this.config$().transfomer?.toModel?.(returnResult, this) ?? returnResult
    );
  });
  override children$$ = computed(() => [
    ...this.fixedControls$(),
    ...this.resetControls$(),
  ]);

  fixedControls$ = signal<AbstractControl[]>([]);
  resetControls$ = signal<AbstractControl[]>([]);
  get controls() {
    return this.children$$();
  }

  removeRestControl(index: number): void {
    this.resetControls$.update((list) => {
      list = list.slice() as any;
      list.splice(index, 1);
      return list;
    });
  }

  override setControl(index: number, control: TControl): void {
    const control$ = this.#inited ? this.resetControls$ : this.fixedControls$;
    control$.update((list) => {
      list = list.slice() as any;
      list[index] = control;
      return list;
    });
    control.setParent(this);
  }

  get length(): number {
    return this.controls.length;
  }

  override reset(value?: any[]): void {
    const initValue = this.getInitValue(value);
    const viewValue =
      this.config$().transfomer?.toView?.(initValue, this) ?? initValue;
    this.beforeUpdateList.forEach((item) => item(viewValue, false));
    this._forEachChild((control: AbstractControl, index: number) => {
      control.reset(initValue[index]);
    });
  }

  override getRawValue() {
    return this.resetControls$().map((control: AbstractControl) =>
      control.getRawValue(),
    );
  }

  clear(): void {
    if (this.resetControls$().length < 1) return;

    this.resetControls$.update(() => []);
  }

  /** @internal */
  override _forEachChild(
    cb: (c: AbstractControl, index: number) => void,
  ): void {
    this.children$$().forEach((control: AbstractControl, index: number) => {
      if (control) {
        cb(control, index);
      }
    });
  }
  /** @internal */
  _reduceChildren<T>(
    initValue: T,
    fn: (acc: T, control: AbstractControl, name: any) => T,
  ): T {
    let res = initValue;
    this._forEachChild((control: AbstractControl, name: any) => {
      res = fn(res, control, name);
    });
    return res;
  }

  override find(name: number): AbstractControl {
    return this.children$$()[name];
  }
  beforeUpdateList: ((value: any[], initValue: boolean) => void)[] = [];
  override updateValue(value: any[] = []): void {
    if (deepEqual(value, this.value$$())) {
      return;
    }
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    this.beforeUpdateList.forEach((item) => item(viewValue, true));
    this._forEachChild((control, i) => {
      control.updateValue(viewValue[i]);
    });
  }
  #inited = false;
  initedValue: any;
  override updateInitValue(value: any): void {
    this.#inited = true;
    const initValue = this.getInitValue(value);
    const viewValue =
      this.config$().transfomer?.toView?.(initValue, this) ?? initValue;
    this.initedValue = viewValue;
    this.beforeUpdateList.forEach((item) => item(viewValue, false));
    this._forEachChild((control, i) => {
      control.updateInitValue(viewValue?.[i]);
    });
  }
}
