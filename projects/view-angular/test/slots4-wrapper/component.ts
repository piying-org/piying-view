import {
  ChangeDetectionStrategy,
  Component,
  viewChild,
} from '@angular/core';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';

@Component({
  selector: 'app-slots4-wrapper',
  templateUrl: './component.html',
  standalone: true,
  imports: [InsertFieldDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slots4WrapperComponent {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
