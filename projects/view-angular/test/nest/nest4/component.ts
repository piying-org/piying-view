import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { PI_INPUT_OPTIONS_TOKEN, PiyingView } from '@piying/view-angular';

@Component({
  selector: 'app-nest4',
  templateUrl: './component.html',
  standalone: true,
  imports: [NgTemplateOutlet, PiyingView],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nest4Component {
  parentPyOptions = inject(PI_INPUT_OPTIONS_TOKEN);
  schema = input<any>();
}
