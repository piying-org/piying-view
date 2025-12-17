import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { EventsDirective } from '../../lib/directives/events.directive';

@Component({
  selector: 'events1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventsDirective],
})
export class Event1Component {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
