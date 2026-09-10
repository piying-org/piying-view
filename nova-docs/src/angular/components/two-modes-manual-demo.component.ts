import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PiyingFieldControlBindDirective,
  PiyingFieldTemplateDirective,
  convertToField,
} from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { actions, setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'two-modes-manual-demo',
  standalone: true,
  templateUrl: './two-modes-manual-demo.component.html',
  imports: [
    FormsModule,
    PiyingFieldControlBindDirective,
    PiyingFieldTemplateDirective,
    JsonPipe,
  ],
})
export class TwoModesManualDemoComponent {
  schema = v.object({
    k1: v.pipe(v.string('必填'), v.minLength(3, '至少 3 个字符')),
    k2: v.pipe(
      v.string(),
      setComponent(InputFCC),
      actions.attributes.set({ placeholder: '由 [fieldTemplate] 自动渲染' }),
    ),
  });

  // schema 以取值函数形式传入；injector 传 undefined，内部会自动获取
  bind = convertToField(() => this.schema, undefined);

  model = signal<unknown>(undefined);

  constructor() {
    this.bind.form.control!.valueChanges.subscribe((value) => {
      this.model.set(value);
    });
  }
}
