import {
  NgControl,
  Validators,
  type AbstractControl,
  type ValidationErrors,
} from '@angular/forms';
import { FieldControl } from '@piying/view-angular-core';

export type InteropSharedKeys =
  | 'value'
  | 'valid'
  | 'invalid'
  | 'touched'
  | 'untouched'
  | 'disabled'
  | 'enabled'
  | 'errors'
  | 'pristine'
  | 'dirty';

export class InteropNgControl extends NgControl {
  constructor(protected field: () => FieldControl<unknown>) {
    super();
  }

  readonly control: AbstractControl<any, any> =
    this as unknown as AbstractControl<any, any>;

  override get value(): any {
    return this.field().value;
  }

  override get valid(): boolean {
    return this.field().valid;
  }

  override get invalid(): boolean {
    return !this.field().valid;
  }

  override get pending(): boolean | null {
    return false;
  }

  override get disabled(): boolean {
    return this.field().disabled;
  }

  override get enabled(): boolean {
    return !this.field().disabled;
  }

  override get errors(): ValidationErrors | null {
    const errors = this.field().errors;
    return errors ?? null;
  }

  override get pristine(): boolean {
    return true;
  }

  override get dirty(): boolean {
    return false;
  }

  override get touched(): boolean {
    return this.field().touched;
  }

  override get untouched(): boolean {
    return !this.field().touched;
  }

  get submitted(): boolean {
    return false;
  }

  override viewToModelUpdate(newValue: any): void {}
  override get valueChanges() {
    return this.field().valueChanges;
  }
  override get statusChanges() {
    return this.field().statusChanges;
  }
  hasValidator(input: any) {
    if (Validators.required === input) {
      return this.field().required$$();
    }
    return false;
  }
}
