import { Component, input, output } from '@angular/core';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';

@Component({
  selector: 'app-wrapper3',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [InsertFieldDirective],
})
export class Wrapper3Component {
  wInput1 = input('1');
  output1 = output<any>();
}
