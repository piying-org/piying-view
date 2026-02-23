import { AbstractControl } from './abstract_model';
import { FieldArray } from './field-array';
import { computed, signal, untracked } from '@angular/core';
import { LogicType, UpdateType } from './type';
import { deepEqual } from 'fast-equals';
// 切换索引后,理论上应该触发下值变更,否则不知道值是什么
export class FieldLogicGroup extends FieldArray {
  activateIndex$ = signal(0);
  type = signal<LogicType>('and');
  activateControls$ = signal<AbstractControl[] | undefined>(undefined);
  #childUpdate() {
    const returnResult = this.getValue(false);
    return this.transformToModel(returnResult, this);
  }
  override originValue$$ = computed<any>(() => {
    if (this.updateOn$$() === 'submit') {
      this.submitIndex$();
      return untracked(() => this.#childUpdate());
    }
    return this.#childUpdate();
  });

  #getActivateControls() {
    let list;
    if (this.activateControls$()) {
      list = this.activateControls$()!;
    } else if (this.type() === 'and') {
      list = this.fixedControls$();
    } else if (this.type() === 'or') {
      list = [this.fixedControls$()[this.activateIndex$()]];
    } else {
      throw new Error('');
    }
    return list;
  }
  override activatedChildren$$ = computed(() => this.#getActivateControls());
  getValue(rawData: boolean) {
    const controls = rawData
      ? this.activatedChildren$$()
      : this.activatedChildren$$().filter((control) =>
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
    this.#updateValue(initValue, UpdateType.reset);
  }
  override getRawValue(): any {
    return this.getValue(true);
  }
  override updateValue(value: any): void {
    if (this.valid && deepEqual(value, this.value$$())) {
      return;
    }
    if (this.isUnChanged()) {
      value ??= this.getInitValue(value);
    }
    this.#updateValue(value, UpdateType.update);
  }
  /** @internal */
  override updateInitValue(value: any): void {
    const initValue = this.getInitValue(value);
    this.#updateValue(initValue, UpdateType.init);
  }
  #updateValue(value: any, type: UpdateType) {
    const viewValue = this.config$().transfomer?.toView?.(value, this) ?? value;
    let isUpdateActivate = false;
    this.fixedControls$().forEach((control, i) => {
      if (type === UpdateType.init) {
        control.updateInitValue(viewValue);
      } else if (type === UpdateType.update) {
        control.updateValue(viewValue);
      } else {
        control.reset(viewValue);
      }
      if (
        !this.config$().disableOrUpdateActivate &&
        !isUpdateActivate &&
        control.valid &&
        control.shouldInclude$$() &&
        this.type() === 'or'
      ) {
        this.activateIndex$.set(i);
        isUpdateActivate = true;
      }
    });
  }
}
