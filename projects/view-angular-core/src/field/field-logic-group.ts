import { AbstractControl } from './abstract_model';
import { FieldArray } from './field-array';
import { computed, signal } from '@angular/core';
import { LogicType } from './type';
import { deepEqual } from 'fast-equals';
// 切换索引后,理论上应该触发下值变更,否则不知道值是什么
export class FieldLogicGroup extends FieldArray {
  /** 待定参数 */
  activateIndex$ = signal(0);
  type = signal<LogicType>('and');
  activateControl$ = signal<AbstractControl[] | undefined>(undefined);
  override value$$ = computed<any>(() => {
    const returnResult = this.getValue(false);
    return (
      this.config$().transfomer?.toModel?.(returnResult, this) ?? returnResult
    );
  });

  getActivateControls() {
    let list;
    if (this.activateControl$()) {
      list = this.activateControl$()!;
    } else if (this.type() === 'and') {
      list = this.controls$();
    } else if (this.type() === 'or') {
      list = [this.controls$()[this.activateIndex$()]];
    } else {
      throw new Error('');
    }
    return list;
  }
  getValue(rawData: boolean) {
    const controls = rawData
      ? this.getActivateControls()
      : this.getActivateControls().filter((control) =>
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

  override getRawValue(): any {
    return this.getValue(true);
  }
  override updateValue(value: any): void {
    if (deepEqual(value, this.value$$())) {
      return;
    }
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    this.controls$().forEach((control, i) => {
      control.updateValue(viewValue);
    });
  }
  override updateInitValue(value: any): void {
    let initValue = this.getInitValue(value);
    const viewValue =
      this.config$().transfomer?.toView?.(initValue, this) ?? initValue;
    this.beforeUpdateList.forEach((item) => item(viewValue));
    this.controls$().forEach((control, i) => {
      control.updateInitValue(viewValue);
    });
  }
}
