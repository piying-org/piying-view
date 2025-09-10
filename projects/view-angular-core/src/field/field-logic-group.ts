import { AbstractControl } from './abstract_model';
import { FieldArray } from './field-array';
import { computed, signal } from '@angular/core';
import { LogicType } from './type';
import { deepEqual } from 'fast-equals';
// 切换索引后,理论上应该触发下值变更,否则不知道值是什么
export class FieldLogicGroup extends FieldArray {
  activateIndex$ = signal(0);
  type = signal<LogicType>('and');
  activateControl$ = signal<AbstractControl[] | undefined>(undefined);
  override value$$ = computed<any>(() => {
    const returnResult = this.getValue(false);
    return (
      this.config$().transfomer?.toModel?.(returnResult, this) ?? returnResult
    );
  });

  #getActivateControls() {
    let list;
    if (this.activateControl$()) {
      list = this.activateControl$()!;
    } else if (this.type() === 'and') {
      list = this.fixedControls$();
    } else if (this.type() === 'or') {
      list = [this.fixedControls$()[this.activateIndex$()]];
    } else {
      throw new Error('');
    }
    return list;
  }
  getValue(rawData: boolean) {
    const controls = rawData
      ? this.#getActivateControls()
      : this.#getActivateControls().filter((control) =>
          control.shouldInclude$$(),
        );
    const control = controls[0];
    if (controls.length === 0) {
      return this.emptyValue$$();
    }
    if (controls.length === 1) {
      return control.value;
    }
    const result = controls.reduce(
      (obj, control) => ({ ...obj, ...control.value$$() }),
      {} as Record<string, any>,
    );
    return Object.keys(result).length ? result : this.emptyValue$$();
  }
  override reset(value?: any[]): void {
    const initValue = this.getInitValue(value);
    const viewValue =
      this.config$().transfomer?.toView?.(initValue, this) ?? initValue;
    this.fixedControls$().forEach((control, i) => {
      control.reset(viewValue);
    });
  }
  override getRawValue(): any {
    return this.getValue(true);
  }
  override updateValue(value: any): void {
    if (deepEqual(value, this.value$$())) {
      return;
    }
    if (this.isUnChanged()) {
      value ??= this.getInitValue(value);
    }
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    this.fixedControls$().forEach((control, i) => {
      control.updateValue(viewValue);
    });
  }
  /** @internal */
  override updateInitValue(value: any): void {
    const initValue = this.getInitValue(value);
    const viewValue =
      this.config$().transfomer?.toView?.(initValue, this) ?? initValue;
    this.fixedControls$().forEach((control, i) => {
      control.updateInitValue(viewValue);
    });
  }
}
