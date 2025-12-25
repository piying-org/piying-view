import { Component, computed, inject } from '@angular/core';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';
import { PI_VIEW_FIELD_TOKEN } from '../../lib/type';

@Component({
  selector: 'app-wrapper-switch',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [InsertFieldDirective],
})
export class WrapperSwitchComponent {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
}
