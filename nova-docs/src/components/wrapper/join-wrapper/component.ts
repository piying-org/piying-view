import { Component, input, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { InsertFieldDirective } from '@piying/view-angular';
export interface JoinItem {
  icon?: string;
  text?: string;
}
@Component({
  selector: 'app-join-item-wrapper',
  templateUrl: './component.html',
  imports: [MatIcon, InsertFieldDirective],
})
export class JoinItemWC {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  prefix = input<JoinItem>();
  suffix = input<JoinItem>();
}
