import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-slots1',
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slots1Component {}
