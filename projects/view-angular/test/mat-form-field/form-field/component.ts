import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';

import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { PiyingViewWrapperBase } from '@piying/view-angular';
import { summarize } from 'valibot';
import { PurePipe } from '../../../lib/pipe/pure.pipe';
@Component({
  selector: 'mat-form-field-wrapper',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [MatFormFieldModule, CommonModule, PurePipe],
})
export class MatFormFieldWrapper extends PiyingViewWrapperBase {
  formField = viewChild('formField', { read: MatFormField });

  override ngOnInit(): void {
    super.ngOnInit();
    if (
      this.fieldComponentInstance &&
      '__isElement' in this.fieldComponentInstance &&
      this.fieldComponentInstance.__isElement
    ) {
      this.formField()!._control = this.fieldDirectiveRefList![0]!;
    } else if (
      this.fieldComponentInstance instanceof ElementRef ||
      this.fieldDirectiveRefList?.[0].controlType === 'auto'
    ) {
      // 判断是否是元素,如果是那么就用指令
      this.formField()!._control = this.fieldDirectiveRefList![0]!;
    } else {
      this.formField()!._control = this.fieldComponentInstance;
    }
  }

  showError$$ = computed(() => (
      this.field$$().form.control?.errors &&
      (this.field$$().form.control?.dirty ||
        this.field$$().form.control?.touched)
    ));
  errorStr$$ = computed(() => {
    const field = this.field$$();
    const valibot = field.form.control!.errors!['valibot'];
    if (valibot) {
      return summarize(valibot);
    } else {
      return Object.values(field.form.control!.errors!)
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join('\n');
    }
  });
  isString(input: any) {
    return typeof input === 'string';
  }
}
