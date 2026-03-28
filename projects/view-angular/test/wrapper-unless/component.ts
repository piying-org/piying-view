import { Component, input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'selectorless-wrapper',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule],
})
export class SelectorLessW {
  static readonly __version = 2;
  public templateRef = viewChild.required('templateRef');
  wInput1 = input();
}
