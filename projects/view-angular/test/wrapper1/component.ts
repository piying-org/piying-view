import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiWrapperBaseComponent } from '@piying/view-angular';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'app-wrapper1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule],
})
export class Wrapper1Component extends PiWrapperBaseComponent {
  field = inject(PI_VIEW_FIELD_TOKEN);

  wInput1 = input('1');

  ngOnDestroy(): void {}
}
