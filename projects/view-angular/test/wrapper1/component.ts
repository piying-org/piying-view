import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-wrapper1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
})
export class Wrapper1Component {
  wInput1 = input('1');
  output1 = output<any>();
}
