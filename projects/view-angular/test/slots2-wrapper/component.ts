import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';

@Component({
  selector: 'app-slots2-wrapper',
  templateUrl: './component.html',
  standalone: true,
  imports: [InsertFieldDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slots2WrapperComponent {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  filed = inject(PI_VIEW_FIELD_TOKEN);
  slot1 = viewChild.required('slot1', { read: TemplateRef });
  value = computed(() => this.filed().props()['value']);
  constructor() {}
  ngOnInit(): void {
    this.filed().slots.update((slots) => ({
      ...slots,
      '*': this.slot1(),
    }));
  }
}
