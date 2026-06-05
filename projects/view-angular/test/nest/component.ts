import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { PiyingView } from '@piying/view-angular';
import { Nest1Service } from './nest1.service';
import { PI_INPUT_OPTIONS_TOKEN } from '@piying/view-angular-core';

@Component({
  selector: 'app-nest1',
  templateUrl: './component.html',
  standalone: true,
  providers: [Nest1Service],
  imports: [NgTemplateOutlet, PiyingView],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nest1Component {
  parentPyOptions = inject(PI_INPUT_OPTIONS_TOKEN);
  schema = input<any>();
}
