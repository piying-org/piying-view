import { effect, Injector, untracked } from '@angular/core';
// import { ControlValueAccessor } from '@angular/forms';
import { FieldControl } from '../field/field-control';
export interface ControlValueAccessor {
  /**
   * @description
   * Writes a new value to the element.
   *
   * This method is called by the forms API to write to the view when programmatic
   * changes from model to view are requested.
   *
   * @usageNotes
   * ### Write a value to the element
   *
   * The following example writes a value to the native DOM element.
   *
   * ```ts
   * writeValue(value: any): void {
   *   this._renderer.setProperty(this._elementRef.nativeElement, 'value', value);
   * }
   * ```
   *
   * @param obj The new value for the element
   */
  writeValue(obj: any): void;
  /**
   * @description
   * Registers a callback function that is called when the control's value
   * changes in the UI.
   *
   * This method is called by the forms API on initialization to update the form
   * model when values propagate from the view to the model.
   *
   * When implementing the `registerOnChange` method in your own value accessor,
   * save the given function so your class calls it at the appropriate time.
   *
   * @usageNotes
   * ### Store the change function
   *
   * The following example stores the provided function as an internal method.
   *
   * ```ts
   * registerOnChange(fn: (_: any) => void): void {
   *   this._onChange = fn;
   * }
   * ```
   *
   * When the value changes in the UI, call the registered
   * function to allow the forms API to update itself:
   *
   * ```ts
   * host: {
   *    '(change)': '_onChange($event.target.value)'
   * }
   * ```
   *
   * @param fn The callback function to register
   */
  registerOnChange(fn: any): void;
  /**
   * @description
   * Registers a callback function that is called by the forms API on initialization
   * to update the form model on blur.
   *
   * When implementing `registerOnTouched` in your own value accessor, save the given
   * function so your class calls it when the control should be considered
   * blurred or "touched".
   *
   * @usageNotes
   * ### Store the callback function
   *
   * The following example stores the provided function as an internal method.
   *
   * ```ts
   * registerOnTouched(fn: any): void {
   *   this._onTouched = fn;
   * }
   * ```
   *
   * On blur (or equivalent), your class should call the registered function to allow
   * the forms API to update itself:
   *
   * ```ts
   * host: {
   *    '(blur)': '_onTouched()'
   * }
   * ```
   *
   * @param fn The callback function to register
   */
  registerOnTouched(fn: any): void;
  /**
   * @description
   * Function that is called by the forms API when the control status changes to
   * or from 'DISABLED'. Depending on the status, it enables or disables the
   * appropriate DOM element.
   *
   * @usageNotes
   * The following is an example of writing the disabled property to a native DOM element:
   *
   * ```ts
   * setDisabledState(isDisabled: boolean): void {
   *   this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
   * }
   * ```
   *
   * @param isDisabled The disabled status to set on the element
   */
  setDisabledState?(isDisabled: boolean): void;
}
export function createViewControlLink(
  fieldControl: () => FieldControl,
  cva: ControlValueAccessor,
  injector: Injector,
) {
  cva.registerOnChange((value: any) => {
    if (fieldControl().disabled$$()) {
      return;
    }
    fieldControl().pendingStatus.update((status) => ({
      ...status,
      value: value,
      change: true,
    }));
    if (fieldControl().updateOn$$() === 'change') {
      fieldControl().viewValueChange(value);
    }
  });
  cva.registerOnTouched(() => {
    if (fieldControl().disabled$$()) {
      return;
    }
    const updateOn = fieldControl().updateOn$$();
    const pendingStatus = fieldControl().pendingStatus();
    if (updateOn === 'submit') {
      fieldControl().pendingStatus.update((status) => ({
        ...status,
        touched: true,
      }));
    } else {
      fieldControl().markAsTouched();
      if (pendingStatus.change && updateOn === 'blur') {
        fieldControl().viewValueChange(pendingStatus.value);
        fieldControl().pendingStatus.update((status) => ({
          ...status,
          change: false,
          value: undefined,
        }));
      }
    }
  });
  const disposeList: (() => any)[] = [];
  const ref = effect(
    () => {
      const value = fieldControl().modelValueToViewValue$$();
      untracked(() => {
        cva.writeValue(value);
      });
    },
    { injector: injector },
  );
  cva.writeValue(fieldControl().modelValueToViewValue$$());
  disposeList.push(() => ref.destroy());
  if (cva.setDisabledState) {
    const disabledRef = effect(
      () => {
        const value = fieldControl().disabled$$();
        untracked(() => {
          cva.setDisabledState!(value);
        });
      },
      { injector: injector },
    );
    cva.setDisabledState!(fieldControl().disabled$$());
    disposeList.push(() => disabledRef.destroy());
  }
  return (destroy?: boolean) => {
    disposeList.forEach((fn) => fn());
    // todo 需要优化
    untracked(() => {
      fieldControl().updateValue(fieldControl().value$$(), true);
    });
  };
}
