import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';

export class FieldArray<
  TControl extends AbstractControl<any> = any,
> extends AbstractControl {
  #deletionMode$$ = computed(() => this.config$().deletionMode ?? 'shrink');
  override value$$ = computed<any>(() => {
    const list = [];
    for (const control of this.controls$()) {
      if (control && control.shouldInclude$$()) {
        list.push(control.value$$());
      } else {
        if (this.#deletionMode$$() === 'shrink') {
          continue;
        } else if (this.#deletionMode$$() === 'mark') {
          list.push(undefined);
        }
      }
    }
    const returnResult = list.length === 0 ? this.emptyValue$$() : list;
    return (
      this.config$().transfomer?.toModel?.(returnResult, this) ?? returnResult
    );
  });
  override children$$ = computed(() => this.controls$());

  controls$ = signal<AbstractControl[]>([]);
  get controls() {
    return this.controls$();
  }

  removeAt(index: number): void {
    const adjustedIndex = this._adjustIndex(index);

    if (this.controls$()[adjustedIndex]) {
      this.controls$.update((list) => {
        list = list.slice() as any;
        list.splice(adjustedIndex, 1);
        return list;
      });
    }
  }

  override setControl(index: number, control: TControl): void {
    const adjustedIndex = this._adjustIndex(index);

    this.controls$.update((list) => {
      list = list.slice() as any;
      list[adjustedIndex] = control;
      return list;
    });
    control.setParent(this);
  }

  get length(): number {
    return this.controls$().length;
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
    return this.controls$().map((control: AbstractControl) =>
      control.getRawValue(),
    );
  }

  clear(): void {
    if (this.controls$().length < 1) return;

    this.controls$.update(() => []);
  }

  private _adjustIndex(index: number): number {
    return index < 0 ? Math.max(index + this.length, 0) : index;
  }

  /** @internal */
  override _forEachChild(
    cb: (c: AbstractControl, index: number) => void,
  ): void {
    this.controls$().forEach((control: AbstractControl, index: number) => {
      if (control) {
        cb(control, index);
      }
    });
  }

  override find(name: number): AbstractControl {
    return this.controls$()[this._adjustIndex(name)];
  }
  beforeUpdateList: ((value: any[], initValue: boolean) => void)[] = [];
  override updateValue(value: any[] = []): void {
    if (deepEqual(value, this.value$$())) {
      return;
    }
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    this.beforeUpdateList.forEach((item) => item(viewValue, true));
    this.controls$().forEach((control, i) => {
      control.updateValue(viewValue[i]);
    });
  }
  initedValue: any;
  override updateInitValue(value: any): void {
    const initValue = this.getInitValue(value);
    const viewValue =
      this.config$().transfomer?.toView?.(initValue, this) ?? initValue;
    this.initedValue = viewValue;
    this.beforeUpdateList.forEach((item) => item(viewValue, false));
    this.controls$().forEach((control, i) => {
      control.updateInitValue(viewValue?.[i]);
    });
  }
}
