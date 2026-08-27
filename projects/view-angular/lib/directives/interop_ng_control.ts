import { inject, Injector } from '@angular/core';
import {
  ControlEvent,
  NgControl,
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  Validators,
  ValueChangeEvent,
  type AbstractControl,
  type ValidationErrors,
} from '@angular/forms';
import { FieldControl, PENDING, toObservable } from '@piying/view-angular-core';
import { combineLatest, map, merge, Observable } from 'rxjs';

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
    return this.field().status$$() === PENDING;
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
    return this.field().pristine;
  }

  override get dirty(): boolean {
    return this.field().dirty;
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
  #injector = inject(Injector);
  #event: Observable<ControlEvent> | undefined;
  get events() {
    return (
      this.#event ??
      (this.#event = merge(
        toObservable(this.field().touched$$, this.field().touched$$, {
          injector: this.#injector,
        }).pipe(map((value) => new TouchedChangeEvent(value, this as any))),
        toObservable(this.field().dirty$$, this.field().dirty$$, {
          injector: this.#injector,
        }).pipe(map((value) => new PristineChangeEvent(value, this as any))),
        combineLatest([
          this.field().statusChanges,
          toObservable(this.field().disabled$$, this.field().disabled$$, {
            injector: this.#injector,
          }),
        ]).pipe(
          map(
            (list) =>
              new StatusChangeEvent(
                list[1] ? 'DISABLED' : list[0],
                this as any,
              ),
          ),
        ),
        this.field().valueChanges.pipe(
          map((value) => new ValueChangeEvent(value, this as any)),
        ),
      ))
    );
  }
}
