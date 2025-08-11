import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';
import { UpdateType } from './type';

export class FieldArray<
  TControl extends AbstractControl<any> = any,
> extends AbstractControl {
  #deletionMode$$ = computed(() => this.config$().deletionMode ?? 'shrink');
  override value$$ = computed<any>(() => {
    let list: any[] = [];
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
    list = [...list, ...(this.resetValue$() ?? [])];
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
    const controls$ = this.#inited ? this.resetControls$ : this.fixedControls$;
    index = this.#inited ? index - this.fixedControls$().length : index;
    controls$.update((list) => {
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
    this.#updateValue(initValue, UpdateType.reset);
  }

  override getRawValue() {
    return this.children$$().map((control: AbstractControl) =>
      control.getRawValue(),
    );
  }

  clear(): void {
    if (this.resetControls$().length < 1) return;

    this.beforeUpdateList.forEach((fn) => fn([], false));
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
  #getResetValue(value: any[] = []) {
    return value.slice(this.fixedControls$().length);
  }
  resetValue$ = signal<any>(undefined);

  #updateValue(value: any, type: UpdateType) {
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    if (type === UpdateType.init) {
      this.initedValue = viewValue;
    }
    if (this.config$().groupMode === 'reset') {
      const restValue = this.#getResetValue(viewValue);
      this.beforeUpdateList.forEach((fn) =>
        fn(restValue, type !== UpdateType.init),
      );
    } else if (
      type === UpdateType.init
        ? this.config$().groupMode === 'loose'
        : this.config$().groupMode === 'default' ||
          this.config$().groupMode === 'loose'
    ) {
      const resetValue = this.#getResetValue(viewValue);
      this.resetValue$.set(resetValue);
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
  override updateValue(value: any[] = []): void {
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
