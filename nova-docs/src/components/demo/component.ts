import { Component, input, output } from '@angular/core';

@Component({
  selector: 'demo-comp',
  template: 'input1: {{input1()}}',
  standalone: true,
})
export class DemoNFCC {
  input1 = input();
  output1 = output();
}
