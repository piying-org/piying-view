import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewGroup } from '@piying/view-angular';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'app-array1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule, PiyingViewGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Array1Component extends PiyingViewGroupBase {}
