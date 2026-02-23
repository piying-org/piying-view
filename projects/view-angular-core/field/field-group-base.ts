import { signal } from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';
import { UpdateType } from './type';

export class FieldGroupbase extends AbstractControl {
  /** @internal */
  protected getResetValue(value: any[] = []) {}
  /** @internal */
  beforeUpdateList: ((value: any, initValue: boolean) => void)[] = [];
  resetValue$ = signal<any>(undefined);
  /** @internal */
  protected submitIndex$ = signal(0);

  /** @internal */
  protected _updateValue(value: any, type: UpdateType) {
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    if (type === UpdateType.init) {
      this.initedValue = viewValue;
    }
    if (this.config$().groupMode === 'reset') {
      const restValue = this.getResetValue(viewValue);
      this.beforeUpdateList.forEach((fn) =>
        fn(restValue, type !== UpdateType.init),
      );
    } else if (
      this.config$().groupMode === 'loose' ||
      this.config$().groupMode === 'strict'
    ) {
      // loose下为了输出值,strict下为了验证
      const resetValue = this.getResetValue(viewValue);
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
  override updateValue(value: any): void {
    if (this.valid && deepEqual(value, this.value$$())) {
      return;
    }
    if (this.isUnChanged()) {
      value ??= this.getInitValue(value);
    }
    this._updateValue(value, UpdateType.update);
  }

  protected inited = false;
  /** @internal */
  initedValue: any;
  /** @internal */
  override updateInitValue(value: any): void {
    this.inited = true;
    const initValue = this.getInitValue(value);
    this._updateValue(initValue, UpdateType.init);
  }
  override reset(value?: any): void {
    const initValue = this.getInitValue(value);
    this._updateValue(initValue, UpdateType.reset);
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

  override emitSubmit(): void {
    super.emitSubmit();
    this.submitIndex$.update((a) => ++a);
  }
}
