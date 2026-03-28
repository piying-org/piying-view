import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'app-group1-selectorless',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Group1SelectorlessComponent extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
