import { JsonPipe } from '@angular/common';
import {
  Component,
  Injector,
  computed,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <span class="w-28 shrink-0 text-sm">[formControl]：</span>
        <input
          type="text"
          class="input input-sm w-full max-w-xs"
          [formControl]="bind()"
          [path]="['k1']"
          #k1="formControl"
        />
      </div>
      @if (k1.valibotIssueSummary$$()) {
        <p class="text-error text-sm">{{ k1.valibotIssueSummary$$() }}</p>
      }

      <div class="flex items-center gap-2">
        <span class="w-28 shrink-0 text-sm">[fieldTemplate]：</span>
        <div class="w-full max-w-xs">
          <ng-container [fieldTemplate]="bind()" [path]="['k2']" />
        </div>
      </div>

      <pre class="mt-2 rounded-box bg-base-200 p-3 text-sm">Model 值: {{ model() | json }}</pre>
    </div>
  `,
  imports: [
    FormsModule,
    PiyingFieldControlBindDirective,
    PiyingFieldTemplateDirective,
    JsonPipe,
  ],
})
export class TwoModesManualDemoComponent {
  private injector = inject(Injector);

  schema = v.object({
    k1: v.pipe(v.string('必填'), v.minLength(3, '至少 3 个字符')),
    k2: v.pipe(
      v.string(),
      setComponent(InputFCC),
      actions.attributes.set({ placeholder: '由 [fieldTemplate] 自动渲染' }),
    ),
  });

  // schema 与 options 均以取值函数形式传入
  bind = computed(() =>
    untracked(() => convertToField(() => this.schema, this.injector)),
  );

  model = signal<unknown>(undefined);

  constructor() {
    this.bind().form.control!.valueChanges.subscribe((value) => {
      this.model.set(value);
    });
  }
}
