import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewGroup } from '@piying/view-angular';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'switch-group',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchGroupComponent extends PiyingViewGroupBase {
  activate = input(0)
}
