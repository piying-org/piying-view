import {
  signal,
  untracked,
  computed,
  Signal,
  Injector,
  linkedSignal,
} from '@angular/core';

import { FieldFormConfig$ } from './type';
import { SchemaOrPipe } from '@piying/valibot-visit';
import * as v from 'valibot';
import { Observable } from 'rxjs';
import { clone, toObservable } from '../util';
import {
  asyncValidatorToSignal,
  ValidatorPending,
} from '../util/async-validator-convert';
import { PI_CONTEXT_TOKEN } from '../builder-base/type/token';
export type ValidationErrors = {
  [key: string]: any;
};
export interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | undefined;
}
export interface AsyncValidatorFn {
  (
    control: AbstractControl,
  ):
    | Promise<ValidationErrors | undefined>
    | Observable<ValidationErrors | undefined>;
}

function shortCircuitTrue(value: boolean): boolean {
  return value;
}

export const VALID = 'VALID';

export const INVALID = 'INVALID';

export const PENDING = 'PENDING';

export type VALID_STATUS = typeof VALID | typeof INVALID | typeof PENDING;
export type FormHooks = 'change' | 'blur' | 'submit';
export type AbstractControlParams = ConstructorParameters<
  typeof AbstractControl<any>
>;

export abstract class AbstractControl<TValue = any> {
  protected readonly emptyValue$$ = computed(() =>
    clone(this.config$().emptyValue),
  );
  /** 父级取值时,当前子级是否包含在内 */
  shouldInclude$$ = computed(
    () =>
      this.valueNoError$$() &&
      (!this.selfDisabled$$() ||
        (this.selfDisabled$$() && this.config$().disabledValue === 'reserve')),
  );
  readonly injector;
  /** model的value */
  abstract value$$: Signal<TValue | undefined>;
  abstract children$$?: Signal<AbstractControl[]>;
  /** disabled */
  readonly selfDisabled$$ = computed(() => this.config$?.().disabled ?? false);
  /** `self` || `parent` */
  readonly disabled$$: Signal<boolean> = computed(
    () => (this.parent?.disabled$$() || this.selfDisabled$$()) ?? false,
  );
  readonly enabled$$ = computed(() => !this.disabled$$());
  get disabled(): boolean {
    return this.disabled$$();
  }
  get enabled(): boolean {
    return !this.disabled$$();
  }
  enable() {
    this.config$.update((config) => ({ ...config, disabled: false }));
  }
  disable() {
    this.config$.update((config) => ({ ...config, disabled: true }));
  }
  /** touched */
  readonly selfTouched$ = signal(false);

  readonly touched$$: Signal<boolean> = computed(() =>
    this.reduceChildren(
      this.selfTouched$(),
      (child, value) => value || child.touched$$(),
      shortCircuitTrue,
    ),
  );
  get touched(): boolean {
    return untracked(this.touched$$);
  }
  get untouched(): boolean {
    return !untracked(this.touched$$);
  }
  /** dirty */
  private readonly selfDirty$ = signal(false);

  readonly dirty$$: Signal<boolean> = computed(() =>
    this.reduceChildren(
      this.selfDirty$(),
      (child, value) => value || child.dirty$$(),
      shortCircuitTrue,
    ),
  );
  get dirty(): boolean {
    return untracked(this.dirty$$);
  }
  get pristine(): boolean {
    return !untracked(this.dirty$$);
  }
  /** validator */
  #validators$$ = computed(() => this.config$().validators ?? []);
  #asyncValidators$$ = computed(() => this.config$().asyncValidators ?? []);
  protected resetIndex$ = signal(0);
  syncError$ = linkedSignal(
    computed(
      () => {
        const disabled = this.disabled$$();
        if (disabled) {
          return undefined;
        }
        this.resetIndex$();
        this.value$$();
        const result = this.#validators$$().reduce((obj, item) => {
          const result = untracked(() => item(this));
          if (result) {
            obj = { ...obj, ...result };
          }
          return obj;
        }, {} as ValidationErrors);
        const schemaResult = this.#schemaCheck$$();
        if (!schemaResult.success) {
          return { ...result, valibot: schemaResult.issues };
        }
        return Object.keys(result).length
          ? (result as ValidationErrors)
          : undefined;
      },
      { equal: () => false },
    ),
  );
  asyncErrorRes$$ = computed(() => {
    const result = this.#asyncValidators$$();
    if (result.length === 0) {
      return undefined;
    }
    this.resetIndex$();
    this.value$$();
    const dataList = result.map((item) =>
      untracked(() => asyncValidatorToSignal(item(this))),
    );
    return computed(() => {
      const params = dataList.map((item) => item());
      let pendingCount = 0;
      const errorResult = params.reduce(
        (obj, item) => {
          if (item === ValidatorPending) {
            pendingCount++;
            return obj;
          } else if ('value' in item) {
            return { ...obj, ...item.value };
          } else {
            return { ...obj, error: item.error };
          }
        },
        {} as Record<string, any>,
      );
      if (!Object.keys(errorResult).length) {
        if (pendingCount) {
          return ValidatorPending;
        }
        return undefined;
      } else {
        return errorResult;
      }
    });
  });
  asyncError$$ = computed(() => {
    const disabled = this.disabled$$();
    if (disabled) {
      return undefined;
    }
    const ref = this.asyncErrorRes$$();
    if (ref) {
      const result = ref();
      if (result === ValidatorPending) {
        return PENDING;
      } else {
        return result;
      }
    }
    return undefined;
  });
  rawError$$ = computed(() => {
    const disabled = this.disabled$$();
    if (disabled) {
      return undefined;
    }
    const syncError = this.syncError$();
    const asyncError = this.asyncError$$();
    if (asyncError === PENDING) {
      return PENDING;
    }
    if (syncError && asyncError) {
      return { ...syncError, ...asyncError };
    } else if (syncError || asyncError) {
      return syncError || asyncError;
    } else {
      return undefined;
    }
  });
  valueNoError$$ = computed(() => this.rawError$$() === undefined);
  get errors() {
    const error = this.rawError$$();
    return error === PENDING ? undefined : error;
  }
  /** parent */
  private _parent?: AbstractControl;
  get parent(): AbstractControl | undefined {
    return this._parent;
  }

  get value() {
    return this.value$$();
  }
  required$$ = computed(() => this.config$().required);
  readonly schemaParser;
  context;
  constructor(rawSchema: SchemaOrPipe, injector: Injector) {
    this.injector = injector;
    this.schemaParser = v.safeParser(rawSchema);
    this.context = this.injector.get(PI_CONTEXT_TOKEN);
  }

  #schemaCheck$$ = computed(() => this.schemaParser(this.value$$()));
  setParent(parent: AbstractControl | undefined): void {
    this._parent = parent;
  }
  get valid(): boolean {
    return this.status$$() === VALID;
  }

  get invalid(): boolean {
    return this.status$$() === INVALID;
  }

  get pending(): boolean {
    return this.status$$() === PENDING;
  }

  selfUpdateOn$$ = computed(() => this.config$?.().updateOn);
  updateOn$$: Signal<FormHooks> = computed(
    () => (this.selfUpdateOn$$() || this.parent?.updateOn$$()) ?? 'change',
  );

  markAsTouched(): void {
    this.selfTouched$.set(true);
  }

  markAllAsDirty(): void {
    this.markAsDirty();
    this._forEachChild((control) => control.markAllAsDirty());
  }

  markAllAsPristine(): void {
    this.markAsPristine();
    this._forEachChild((control) => control.markAllAsPristine());
  }

  markAllAsTouched(): void {
    this.markAsTouched();
    this._forEachChild((control) => control.markAllAsTouched());
  }
  markAllAsUntouched(): void {
    this.markAsUntouched();
    this._forEachChild((control) => control.markAllAsUntouched());
  }
  markAsUntouched(): void {
    this.selfTouched$.set(false);
  }

  markAsDirty(): void {
    this.selfDirty$.set(true);
  }

  markAsPristine(): void {
    this.selfDirty$.set(false);
  }

  abstract reset(value?: any): void;

  getRawValue(): any {
    return this.value;
  }

  get<P extends string | (string | number)[]>(path: P): AbstractControl | null {
    let currPath: Array<string | number> | string = path;
    if (currPath == null) return null;
    if (!Array.isArray(currPath)) currPath = currPath.split('.');
    if (currPath.length === 0) return null;
    return currPath.reduce(
      (control: AbstractControl | null, name) => control && control.find(name),
      this,
    );
  }

  get root(): AbstractControl {
    let x: AbstractControl = this;

    while (x._parent) {
      x = x._parent;
    }

    return x;
  }

  /** @internal */
  abstract _forEachChild(cb: (c: AbstractControl) => void): void;
  abstract updateValue(value: any): void;
  config$: FieldFormConfig$ = signal({});
  initConfig(config: any) {
    this.config$ = config;
  }

  find(name: string | number): AbstractControl | null {
    return null;
  }
  setControl(name: string | number, control: AbstractControl) {}
  private reduceChildren<T>(
    initialValue: T,
    fn: (child: AbstractControl<any>, value: T) => T,
    shortCircuit?: (value: T) => boolean,
  ): T {
    const childrenMap = this.children$$?.();
    if (!childrenMap) {
      return initialValue;
    }
    let value = initialValue;
    for (const child of childrenMap) {
      if (shortCircuit?.(value)) {
        break;
      }
      value = fn(child, value);
    }
    return value;
  }
  #valueChange: Observable<any> | undefined;
  get valueChanges() {
    return (
      this.#valueChange ??
      (this.#valueChange = toObservable(
        computed(() => ({
          value: this.value$$(),
          disabled: this.disabled$$(),
        })),
        this.value$$,
        {
          injector: this.injector,
        },
      ))
    );
  }
  status$$ = computed(() => {
    if (this.disabled$$()) {
      return VALID;
    }
    const childStatus = this.reduceChildren<VALID_STATUS>(
      VALID,
      (child, value) => {
        if (value === INVALID || child.status$$() === INVALID) {
          return INVALID;
        } else if (value === PENDING || child.status$$() === PENDING) {
          return PENDING;
        }
        return VALID;
      },
      (v) => v === INVALID || v === PENDING,
    );
    if (childStatus === VALID) {
      if (this.rawError$$()) {
        if (this.rawError$$() !== PENDING) {
          return INVALID;
        } else {
          return PENDING;
        }
      }
    }
    return childStatus;
  });
  #statusChange: Observable<VALID_STATUS> | undefined;

  get statusChanges() {
    return (
      this.#statusChange ??
      (this.#statusChange = toObservable(this.status$$, this.status$$, {
        injector: this.injector,
      }))
    );
  }
  /** 仅触发 updateOn: submit 时使用 */
  emitSubmit() {
    if (this.children$$) {
      this.children$$().forEach((child) => {
        child.emitSubmit();
      });
    }
  }
}
