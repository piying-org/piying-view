import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { summarize } from 'valibot';
import { PurePipe } from '../../../lib/pipe/pure.pipe';
import { InsertFieldDirective } from '../../../lib/component/insert-field.directive';
import { PI_VIEW_FIELD_TOKEN } from '../../../lib/type';
import { MatFormControlBindDirective } from './mat-bind.directive';
@Component({
  selector: 'mat-form-field-wrapper',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [
    MatFormFieldModule,
    CommonModule,
    PurePipe,
    InsertFieldDirective,
    MatFormControlBindDirective,
  ],
})
export class MatFormFieldWrapper {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());

  showError$$ = computed(
    () =>
      this.field$$().form.control?.errors &&
      (this.field$$().form.control?.dirty ||
        this.field$$().form.control?.touched),
  );
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
