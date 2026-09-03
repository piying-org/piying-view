import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  untracked,
} from '@angular/core';
import {
  PiyingFieldTemplateDirective,
  convertToField,
} from '@piying/view-angular';
import * as v from 'valibot';

@Component({
  selector: 'app-field-template-error',
  templateUrl: './component.html',
  standalone: true,
  imports: [PiyingFieldTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTemplateErrorComponent {
  injector = inject(Injector);
  schema = input.required<v.BaseSchema<any, any, any>>();
  options = input<any>();
  bind = computed(() =>
    untracked(() => convertToField(this.schema, this.injector, this.options)),
  );
  trackFn = (index: number) => index;
}
