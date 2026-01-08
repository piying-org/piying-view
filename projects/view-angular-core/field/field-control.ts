import {
  computed,
  DestroyRef,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';

import { AbstractControl } from './abstract_model';
import { deepEqual } from 'fast-equals';
import { Subject } from 'rxjs';

export class FieldControl<TValue = any> extends AbstractControl<TValue> {
  #viewIndex = 0;
  /** 视图变化时model值不变也要更新view */
  private viewIndex$ = signal(0);

  /** model输入值 */
  modelValue$: WritableSignal<TValue | undefined> = signal(undefined);
  private modelValueToViewValueOrigin$$ = computed(() => {
    const viewValue = this.modelValue$();
    const toView = this.config$?.().transfomer?.toView;
    if (toView) {
      return toView(viewValue, this);
    }
    return viewValue;
  });
  /** 传入到view中的值 */
  modelValueToViewValue$$ = computed(
    () => {
      this.viewIndex$();
      return this.modelValueToViewValueOrigin$$();
    },
    { equal: () => false },
  );
  /** modelValue + viewValue => modelValue */
  override value$$ = signal<any>(undefined);

  override reset(formState: TValue = this.config$().defaultValue): void {
    this.markAsPristine();
    this.markAsUntouched();
    this.updateValue(formState);
    super.reset(formState);
  }

  #viewSubject$$ = computed(() => {
    const subject = new Subject<any>();
    this.injector.get(DestroyRef).onDestroy(() => {
      subject.complete();
    });
    subject.pipe(this.config$().pipe!.toModel!).subscribe((value: any) => {
      untracked(() => {
        this.#viewValueChange(value);
      });
    });
    return subject;
  });

  #viewValueChange(value: TValue | undefined) {
    this.markAllAsDirty();
    this.#viewIndex++;
    const toModel = this.config$?.().transfomer?.toModel;
    const originValue = toModel ? toModel(value, this) : value;
    const transfomered = this.schemaParser(originValue);
    if (transfomered.success) {
      this.value$$.set(transfomered.output);
      this.syncError$.update((data) => {
        if (data) {
          delete data['valibot'];
        }
        return data && Object.keys(data).length ? data : undefined;
      });
    } else {
      this.syncError$.update((data) => ({
        ...data,
        valibot: transfomered.issues,
      }));
    }
  }

  /** view变更 */
  viewValueChange(value: TValue | undefined) {
    if (this.config$().pipe?.toModel) {
      this.#viewSubject$$().next(value);
    } else {
      this.#viewValueChange(value);
    }
  }
  override updateValue(value: any, force?: boolean): void {
    if (this.isUnChanged() || force) {
      value ??= this.getInitValue(value);
      this.modelValue$.set(value);
      this.value$$.set(value);
      this.#viewIndex++;
      this.viewIndex$.set(this.#viewIndex);
      this.resetIndex$.update((a) => a + 1);
      return;
    }
    if (deepEqual(value, this.value$$())) {
      return;
    }
    this.modelValue$.set(value);
    this.value$$.set(value);
    this.viewIndex$.set(this.#viewIndex);
  }

  override emitSubmit(): void {
    const pendingStatus = this.pendingStatus();

    if (pendingStatus.change) {
      this.viewValueChange(pendingStatus.value);
    }
    super.emitSubmit();
  }
  override updateInitValue(value: any): void {
    const initValue = this.getInitValue(value);
    this.modelValue$.set(initValue);
    this.value$$.set(initValue);
  }
}
