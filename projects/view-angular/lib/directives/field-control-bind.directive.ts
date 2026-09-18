import { computed, Directive, inject, input, Provider } from '@angular/core';

import { NgControl } from '@angular/forms';
import {
  _PiResolvedCommonViewFieldConfig,
  errorSummary,
  isFieldControl,
  KeyPath,
  PiFieldBindPath,
  PiFieldControlGet,
  PiFieldGet,
} from '@piying/view-angular-core';
import { FieldControlBase } from './field-control-base';

const formControlBinding: Provider = {
  provide: NgControl,
  useFactory: () => inject(PiyingFieldControlBindDirective).ngControl,
};
// 必须这么起名来模拟动态绑定,否则的话定义会被覆盖
@Directive({
  selector: '[formControl]',
  providers: [formControlBinding],
  standalone: true,
  exportAs: 'formControl',
})
export class PiyingFieldControlBindDirective<
  S = _PiResolvedCommonViewFieldConfig,
  P extends KeyPath = [],
> extends FieldControlBase {
  formControl = input.required<S>();
  path = input<[...P]| PiFieldBindPath<S>>();

  /** 运行时解析结果(宽松类型), 供内部逻辑使用 */
  #resolved = computed<_PiResolvedCommonViewFieldConfig | undefined>(() => {
    const base =
      this.formControl() as unknown as _PiResolvedCommonViewFieldConfig;
    const keyPath = this.path();
    return (keyPath ? base.get(keyPath) : base) as
      | _PiResolvedCommonViewFieldConfig
      | undefined;
  });

  field$$ = computed(
    (): PiFieldGet<S, P> | undefined =>
      this.#resolved() as unknown as PiFieldGet<S, P> | undefined,
  );
  override fieldControl$$ = computed<PiFieldControlGet<S, P>>(() => {
    const control = this.#resolved()?.form.control;
    if (!control) {
      throw new Error(
        `📍 fieldControlBind:[${this.#resolved()?.keyPath || ''}]->[${this.path() || ''}]❗`,
      );
    }
    if (!isFieldControl(control)) {
      throw new Error(`🏷️ fieldControl❗`);
    }
    return control;
  });

  summaryList$$ = computed(() => errorSummary(this.#resolved()?.form.control));
  valibotIssueSummary$$ = computed(() =>
    this.summaryList$$()
      .map((item) => item.valibotIssueSummary!)
      .filter(Boolean)
      .join('\n'),
  );
}
