import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'rest-group',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestGroupComponent extends PiyingViewGroupBase {}
