import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';
import { Slots1ContentComponent } from '../slots-child/component';

@Component({
  selector: 'app-slots3-wrapper',
  templateUrl: './component.html',
  standalone: true,
  imports: [Slots1ContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slots3WrapperComponent {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  filed = inject(PI_VIEW_FIELD_TOKEN);
  slot1 = viewChild.required('slot1', { read: TemplateRef });
  value = computed(() => this.filed().props()['value']);
  ngOnInit(): void {
    this.filed().slots.update((slots) => ({
      ...slots,
      '*': this.slot1(),
    }));
  }
}
