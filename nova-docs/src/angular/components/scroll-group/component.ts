import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PI_VIEW_FIELD_TOKEN, PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'scroll-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet, FormsModule],
})
export default class ScrollFGC extends PiyingViewGroupBase {
  field = inject(PI_VIEW_FIELD_TOKEN);
  scrollHeight = input<number>(500);
  placeholerHeight = input<number>(20);
}
