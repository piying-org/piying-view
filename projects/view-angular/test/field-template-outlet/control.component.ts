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
  PiyingFieldControlBindDirective,
  convertToField,
} from '@piying/view-angular';
import * as v from 'valibot';

@Component({
  selector: 'app-control-error',
  templateUrl: './control.component.html',
  standalone: true,
  imports: [FormsModule, PiyingFieldControlBindDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlErrorComponent {
  injector = inject(Injector);
  schema = input.required<v.BaseSchema<any, any, any>>();
  bind = computed(() =>
    untracked(() => convertToField(this.schema, this.injector)),
  );
  trackFn = (index: number) => index;
}
