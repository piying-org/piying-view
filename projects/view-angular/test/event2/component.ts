import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventsDirective } from '../../lib/directives/events.directive';

@Component({
  selector: 'events2',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventsDirective],
})
export class Event2Component {}
