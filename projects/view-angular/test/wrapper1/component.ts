import { Component, input, output } from '@angular/core';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';

@Component({
  selector: 'app-wrapper1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [InsertFieldDirective],
})
export class Wrapper1Component {
  wInput1 = input('1');
  output1 = output<any>();
}
