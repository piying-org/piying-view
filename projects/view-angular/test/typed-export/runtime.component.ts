import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PiyingFieldControlBindDirective,
  convertToField,
} from '@piying/view-angular';
import { typedRoot } from './schema';

@Component({
  selector: 'app-typed-export-runtime',
  standalone: true,
  imports: [FormsModule, PiyingFieldControlBindDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input class="f-a" type="text" [formControl]="bind()" [path]="['a']" />
    <input
      class="f-c"
      type="text"
      [formControl]="bind()"
      [path]="['list', 0, 'c']"
    />
    <input
      class="f-alias"
      type="text"
      [formControl]="bind()"
      [path]="['@bb']"
    />
  `,
})
export class TypedExportRuntimeComponent {
  injector = inject(Injector);
  bind = computed(() =>
    untracked(() => convertToField(() => typedRoot, this.injector)),
  );
}
