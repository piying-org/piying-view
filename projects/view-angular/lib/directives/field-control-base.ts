import { Directive, inject, Injector, OnDestroy, Signal } from '@angular/core';

import {
  ControlValueAccessor,
  DefaultValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  RangeValueAccessor,
} from '@angular/forms';
import { createViewControlLink, FieldControl } from '@piying/view-angular-core';
import { InteropNgControl } from './interop_ng_control';
const BuiltInControlValueAccessor = Object.getPrototypeOf(
  RangeValueAccessor.prototype,
).constructor;
function isBuiltInAccessor(valueAccessor: ControlValueAccessor): boolean {
  return (
    Object.getPrototypeOf(valueAccessor.constructor) ===
    BuiltInControlValueAccessor
  );
}
@Directive({})
export class FieldControlBase implements OnDestroy {
  fieldControl$$!: Signal<FieldControl>;
  readonly cvaArray = inject<ControlValueAccessor[]>(NG_VALUE_ACCESSOR);
  readonly injector = inject(Injector);

  get cva() {
    let builtinAccessor: ControlValueAccessor | undefined = undefined;
    let customAccessor: ControlValueAccessor | undefined = undefined;
    this.cvaArray.forEach((v: ControlValueAccessor) => {
      if (v.constructor === DefaultValueAccessor) {
      } else if (isBuiltInAccessor(v)) {
        builtinAccessor = v;
      } else {
        customAccessor = v;
      }
    });
    return customAccessor ?? builtinAccessor ?? this.cvaArray[0];
  }
  #_ngControl: InteropNgControl | undefined;

  get ngControl(): NgControl {
    return (this.#_ngControl ??= new InteropNgControl(() =>
      this.fieldControl$$(),
    )) as unknown as NgControl;
  }

  #disposeFn?: (destroyed?: boolean) => void;
  ngOnChanges(): void {
    this.#disposeFn?.();
    this.#disposeFn = createViewControlLink(
      this.fieldControl$$,
      this.cva,
      this.injector,
    );
  }

  /** @docs-private */
  ngOnDestroy() {
    this.#disposeFn?.(true);
  }
}
