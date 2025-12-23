import { computed, Directive, ElementRef, input } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { InsertFieldDirective } from '@piying/view-angular';

@Directive({
  selector: '[matFormControlBind]',
})
export class MatFormControlBindDirective {
  matFormControlBind = input<InsertFieldDirective>();
  fieldComponentInstance = computed(() => {
    return this.matFormControlBind()?.fieldComponentInstance;
  });
  matFormFiled = input<MatFormField>();
  fieldDirectiveRefList = computed(() => {
    return this.matFormControlBind()?.fieldDirectiveRefList;
  });
  ngOnChanges(): void {
    let fieldComponentInstance = this.fieldComponentInstance();
    if (
      fieldComponentInstance &&
      '__isElement' in fieldComponentInstance &&
      fieldComponentInstance.__isElement
    ) {
      this.matFormFiled()!._control = this.fieldDirectiveRefList()![0]!;
    } else if (
      fieldComponentInstance instanceof ElementRef ||
      this.fieldDirectiveRefList()?.[0].controlType === 'auto'
    ) {
      // 判断是否是元素,如果是那么就用指令
      this.matFormFiled()!._control = this.fieldDirectiveRefList()![0]!;
    } else {
      this.matFormFiled()!._control = fieldComponentInstance;
    }
  }
}
