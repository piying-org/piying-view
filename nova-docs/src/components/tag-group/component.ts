import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'tabs-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet],
})
export default class TabsFGC extends PiyingViewGroupBase {
  static index = 0;
  name = `tabs-group-${TabsFGC.index++}`;
  stepsLike = input<boolean>(false);
}
