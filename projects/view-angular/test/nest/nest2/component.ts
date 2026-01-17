import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { PI_INPUT_OPTIONS_TOKEN, PiyingView } from '@piying/view-angular';
import { Nest1Service } from '../nest1.service';
import { SelectorlessOutlet } from '@cyia/ngx-common/directive';

@Component({
  selector: 'app-nest2',
  templateUrl: './component.html',
  standalone: true,
  providers: [Nest1Service],
  imports: [SelectorlessOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nest2Component {
  readonly PiyingView = PiyingView;

  parentPyOptions = inject(PI_INPUT_OPTIONS_TOKEN);
  schema = input<any>();
  schemaOptions$$ = computed(() => ({
    schema: this.schema(),
    options: this.parentPyOptions!(),
    selectorless: true,
  }));
}
