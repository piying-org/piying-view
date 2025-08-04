import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'test-emit1',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Emit1Component {
  output1 = output<string>();
  output2 = output<string>();
  constructor() {}
  output1Emit() {
    this.output1.emit('emit1-output1-data');
  }
  output2Emit() {
    this.output2.emit('emit1-output2-data');
  }
}
