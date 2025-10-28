import { computed, signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { FieldGroupbase } from './field-group-base';

export class FieldArray<
  TControl extends AbstractControl<any> = any,
> extends FieldGroupbase {
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
    return this.transfomerToModel$$()?.(returnResult, this) ?? returnResult;
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

  removeRestControl(key: number): void {
    if (!this.resetControls$()[key]) {
      return;
    }
    this.resetControls$.update((controls) => {
      controls = controls.slice() as any;
      controls.splice(key, 1);
      return controls;
    });
  }

  override setControl(key: number, control: TControl): void {
    const controls$ = this.inited ? this.resetControls$ : this.fixedControls$;
    key = this.inited ? key - this.fixedControls$().length : key;
    controls$.update((list) => {
      list = list.slice() as any;
      list[key] = control;
      return list;
    });
    control.setParent(this);
  }

  get length(): number {
    return this.controls.length;
  }

  override getRawValue() {
    return this._reduceChildren([], (acc, control, key) => {
      acc[key] = control.getRawValue();
      return acc;
    });
  }
  clear(): void {
    if (this.resetControls$().length < 1) return;
    this.beforeUpdateList.forEach((fn) => fn([], false));
  }

  /** @internal */
  override _forEachChild(cb: (c: AbstractControl, key: number) => void): void {
    this.children$$().forEach((control: AbstractControl, index: number) => {
      if (control) {
        cb(control, index);
      }
    });
  }

  override find(key: number): AbstractControl {
    return this.children$$()[key];
  }
  override getResetValue(value: any[] = []) {
    return value.slice(this.fixedControls$().length);
  }
}
