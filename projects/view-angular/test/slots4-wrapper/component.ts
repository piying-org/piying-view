import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';

@Component({
  selector: 'app-slots4-wrapper',
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slots4WrapperComponent {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
