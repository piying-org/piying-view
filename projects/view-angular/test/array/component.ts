import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'app-array1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Array1Component extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
