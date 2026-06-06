import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PiyingFieldControlBindDirective,
  convertToField,
} from '@piying/view-angular';
import * as v from 'valibot';
@Component({
  selector: 'app-group1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule, PiyingFieldControlBindDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomBindComponent {
  injector = inject(Injector);
  schema1 = input<v.BaseSchema<any, any, any>>();
  bind1 = computed(() => {
    const schema = this.schema1();
    return untracked(() =>
      schema ? convertToField(signal(schema), this.injector) : undefined,
    );
  });
  schema2 = input<v.BaseSchema<any, any, any>>();
  bind2 = computed(() => {
    const schema = this.schema2();
    return untracked(() =>
      schema ? convertToField(signal(schema), this.injector) : undefined,
    );
  });
}
