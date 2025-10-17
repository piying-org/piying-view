import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';

import { PiyingViewGroupBase } from './component.base';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'piying-view-group',
  imports: [NgTemplateOutlet],
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiyingViewGroup extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
