import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { AttributesDirective, PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'app-array1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [NgTemplateOutlet, AttributesDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Array1Component extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
