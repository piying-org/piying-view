import { NgTemplateOutlet } from '@angular/common';
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
  AngularFormBuilder,
  PiyingFieldControlBindDirective,
  NgSchemaHandle,
  PiResolvedViewFieldConfig,
} from '@piying/view-angular';
import { convert } from '@piying/view-angular-core';
import * as v from 'valibot';
const DefaultConvertOptions = {
  builder: AngularFormBuilder,
  handle: NgSchemaHandle,
};
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
      convert<PiResolvedViewFieldConfig>(schema as any, {
        ...DefaultConvertOptions,
        injector: this.injector as any,
      }),
    );
  });
  schema2 = input<v.BaseSchema<any, any, any>>();
  bind2 = computed(() => {
    const schema = this.schema2();
    return untracked(() =>
      convert<PiResolvedViewFieldConfig>(schema as any, {
        ...DefaultConvertOptions,
        injector: this.injector as any,
      }),
    );
  });
}
