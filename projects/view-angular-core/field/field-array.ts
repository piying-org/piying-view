import { computed, signal, untracked } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { FieldGroupbase } from './field-group-base';
import { ValueType } from './type';

export class FieldArray<
  TControl extends AbstractControl<any> = any,
> extends FieldGroupbase {
  #deletionMode$$ = computed(() => this.config$().deletionMode ?? 'shrink');

  override originValue$$ = computed<any>(() => {
    if (this.updateOn$$() === 'submit') {
      this.submitIndex$();
      return untracked(() => this.getValueByType(ValueType.valid));
    }
    return this.getValueByType(ValueType.valid);
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
  override *activatedChildren(): Iterable<[string | number, AbstractControl]> {
    const children = this.children$$();
    for (let index = 0; index < children.length; index++) {
      yield [index, children[index]] as [number, AbstractControl];
    }
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

  getValueByType(mode = ValueType.allPartialValid) {
    let list: any[] = [];
    if (mode === ValueType.allPartialValid) {
      this._reduceChildren(list, (acc, control, key) => {
        if (!control.isOptionalEmpty()) {
          acc[key] = control.getRawValue(mode);
        }
        return acc;
      });
    } else if (mode === ValueType.valid) {
      this._reduceChildren(list, (acc, control, name) => {
        if (
          control &&
          control.shouldInclude$$() &&
          !control.isOptionalEmpty()
        ) {
          list.push(control.value$$());
        } else if (this.#deletionMode$$() === 'shrink') {
          return list;
        } else if (this.#deletionMode$$() === 'mark') {
          list.push(undefined);
        }
        return list;
      });
    } else if (mode === ValueType.partialValid) {
      this._reduceChildren(list, (acc, control, name) => {
        if (
          control &&
          control.shouldEmitValue$$() &&
          !control.isOptionalEmpty()
        ) {
          list.push(control.getRawValue(mode));
        } else if (this.#deletionMode$$() === 'shrink') {
          return list;
        } else if (this.#deletionMode$$() === 'mark') {
          list.push(undefined);
        }
        return list;
      });
    }

    list = [...list, ...(this.resetValue$() ?? [])];
    return this.transformToModel(
      list.length === 0 ? this.emptyValue$$() : list,
      this,
    );
  }
  override getRawValue(mode: ValueType = ValueType.allPartialValid) {
    const value = this.getValueByType(mode);
    const result = this.schemaCheck2$$(value);
    return result.output;
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
