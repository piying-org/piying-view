import { Component, computed, inject } from '@angular/core';
import {
  InsertFieldDirective,
  PI_VIEW_FIELD_TOKEN,
} from '@piying/view-angular';

@Component({
  selector: 'tooltip-wrapper',
  templateUrl: './component.html',
  imports: [InsertFieldDirective],
})
export class TooltipWC {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
}
