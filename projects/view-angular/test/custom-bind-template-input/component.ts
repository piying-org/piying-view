import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PiyingFieldTemplateDirective,
  convertToField,
} from '@piying/view-angular';
import * as v from 'valibot';
@Component({
  selector: 'app-group1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule, PiyingFieldTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomBindComponent {
  injector = inject(Injector);
  schema = input.required<v.BaseSchema<any, any, any>>();
  options = input<any>();
  bind = computed(() =>
    untracked(() => convertToField(this.schema, this.injector, this.options)),
  );
}
