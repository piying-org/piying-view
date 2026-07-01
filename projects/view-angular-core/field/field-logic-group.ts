import { AbstractControl } from './abstract_model';
import { FieldArray } from './field-array';
import { computed, signal, untracked } from '@angular/core';
import { LogicType, UpdateType, ValueType } from './type';
import { deepEqual } from 'fast-equals';
import { toObservable } from '../util';
import { merge, switchMap } from 'rxjs';
// 切换索引后,理论上应该触发下值变更,否则不知道值是什么
export class FieldLogicGroup extends FieldArray {
  protected override skipValuePath = true;
  activateIndex$ = signal(0);
  type = signal<LogicType>('and');
  /** 过滤激活控件 */
  filterActivateControl$ = signal<
    | ((
        item: AbstractControl,
        index: number,
        list: AbstractControl[],
      ) => boolean)
    | undefined
  >(undefined);

  override originValue$$ = computed<any>(() => {
    if (this.updateOn$$() === 'submit') {
      this.submitIndex$();
      return untracked(() => this.getValueByType(ValueType.valid));
    }
    return this.getValueByType(ValueType.valid);
  });

  override activatedChildren = computed(() => {
    const filterFn = this.filterActivateControl$();
    const type = this.type();
    if (filterFn) {
      const children = this.children$$();
      return children
        .map((element, index) => [index, element] as [number, AbstractControl])
        .filter(([index, item]) => !!filterFn(item, index, children));
    } else if (type === 'and') {
      return this.fixedControls$().map(
        (control, index) => [index, control] as [number, AbstractControl],
      );
    } else if (type === 'or') {
      const index = this.activateIndex$();
      return [
        [index, this.fixedControls$()[index]] as [number, AbstractControl],
      ];
    }

    return [];
  });
  #childrenOb$$ = toObservable(this.activatedChildren, this.activatedChildren);
  override valueEvent$$ = this.#childrenOb$$.pipe(
    switchMap(() => {
      let list = this.activatedChildren();
      return merge(
        ...list.map((item) => {
          return item[1].valueEvent$$;
        }),
      );
    }),
  );
  #getValue(mode: ValueType) {
    let controls;
    switch (mode) {
      case ValueType.valid: {
        controls = this.activatedChildren()
          .map(([index, control]) => control)
          .filter((control) => control.shouldInclude$$());
        break;
      }
      case ValueType.partialValid: {
        controls = this.activatedChildren()
          .map(([index, control]) => control)
          .filter((control) => control.shouldEmitValue$$());
        break;
      }
      case ValueType.allPartialValid:
        controls = this.activatedChildren().map(([index, control]) => control);
    }
    const control = controls[0];
    if (controls.length === 0) {
      return this.emptyValue$$();
    }
    if (controls.length === 1) {
      return control.value;
    }
    let getChildValue: (control: AbstractControl) => any;
    if (mode === ValueType.valid) {
      getChildValue = (control: AbstractControl) => control.value$$();
    } else {
      getChildValue = (control: AbstractControl) => control.getRawValue(mode);
    }
    const result = controls.reduce(
      (obj, control) => ({ ...obj, ...getChildValue(control) }),
      {} as Record<string, any>,
    );
    return Object.keys(result).length ? result : this.emptyValue$$();
  }
  override getValueByType(mode: ValueType) {
    const returnResult = this.#getValue(mode);
    return this.transformToModel(returnResult, this);
  }
  override reset(value?: any[]): void {
    const initValue = this.getInitValue(value);
    this.#updateValue(initValue, UpdateType.reset);
  }
  override getRawValue(mode: ValueType = ValueType.allPartialValid) {
    const value = this.getValueByType(mode);
    const result = this.schemaCheck2$$(value);
    return result.output;
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
    this.#updateValue(this.getInitValue(value), UpdateType.init);
  }
  #updateValue(value: any, type: UpdateType) {
    const viewValue =
      this.config$().transformer?.toView?.(value, this) ?? value;
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
