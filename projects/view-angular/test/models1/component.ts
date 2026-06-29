import { Component, input, model, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-models',
  templateUrl: './component.html',
})
export class Models1Component implements OnInit {
  toggle() {
    this.input1Change.emit(1);
  }
  toggle2() {
    this.input2.set(1);
  }
  input1 = input(0);
  input1Change = output<number>();
  input2 = model(0);
  constructor() {}

  ngOnInit(): void {}
}
