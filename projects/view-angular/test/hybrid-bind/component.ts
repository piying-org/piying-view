import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PiyingFieldControlBindDirective,
  PiyingFieldOutletDirective,
} from '@piying/view-angular';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';
@Component({
  selector: 'app-hybrid-bind',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [
    FormsModule,
    PiyingFieldControlBindDirective,
    PiyingFieldOutletDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HybridBindComponent {
  injector = inject(Injector);
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
}
