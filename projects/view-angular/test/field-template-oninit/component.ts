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
import { PiResolvedViewFieldConfig } from '../../lib/type';
import * as v from 'valibot';

@Component({
  selector: 'app-field-template-oninit',
  templateUrl: './component.html',
  standalone: true,
  imports: [PiyingFieldTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTemplateOnInitComponent {
  injector = inject(Injector);
  schema = input.required<v.BaseSchema<any, any, any>>();
  options = input<any>();
  onInit = input<(field: PiResolvedViewFieldConfig) => void>();
  bind = computed(() =>
    untracked(() => convertToField(this.schema, this.injector, this.options)),
  );
  
}
