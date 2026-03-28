import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlotService } from './service';

@Component({
  selector: 'app-slots1-content',
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slots1ContentComponent {
  slot = inject(SlotService);
  ngOnDestroy(): void {
    this.slot.destroyed = true;
  }
}
