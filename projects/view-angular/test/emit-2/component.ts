import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'test-emit2',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Emit2Component {
  output1 = output<string>();
  output2 = output<string>();
  constructor() {}
  output1Emit() {
    this.output1.emit('emit2-output1-data');
  }
  output2Emit() {
    this.output2.emit('emit2-output2-data');
  }
}
