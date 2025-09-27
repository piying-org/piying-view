import {
  Directive,
  inject,
  Injector,
  input,
  OnDestroy,
  Provider,
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { createViewControlLink, FieldControl } from '@piying/view-angular-core';
import { InteropNgControl } from './interop_ng_control';

const formControlBinding: Provider = {
  provide: NgControl,
  useFactory: () => inject(FieldControlDirective).ngControl,
};

@Directive({
  selector: '[fieldControl]',
  providers: [formControlBinding],
  standalone: true,
})
export class FieldControlDirective implements OnDestroy {
  fieldControl = input.required<FieldControl>();
  readonly cvaArray = inject<ControlValueAccessor[]>(NG_VALUE_ACCESSOR);
  readonly injector = inject(Injector);

  get cva() {
    return this.cvaArray[0];
  }
  #_ngControl: InteropNgControl | undefined;

  get ngControl(): NgControl {
    return (this.#_ngControl ??= new InteropNgControl(() =>
      this.fieldControl(),
    )) as unknown as NgControl;
  }

  #disposeFn?: (destroyed?: boolean) => void;
  ngOnChanges(): void {
    this.#disposeFn?.();
    this.#disposeFn = createViewControlLink(
      this.fieldControl,
      this.cva,
      this.injector,
    );
  }

  /** @docs-private */
  ngOnDestroy() {
    this.#disposeFn?.(true);
  }
}
