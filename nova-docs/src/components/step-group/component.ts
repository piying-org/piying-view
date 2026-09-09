import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'steps-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet],
})
export default class StepsFGC extends PiyingViewGroupBase {
  activatedIndex$ = signal(0);
  activatedItem$$ = computed(
    () => this.field$$().children!()[this.activatedIndex$()],
  );

  toPrev() {
    this.activatedIndex$.update((value) => value - 1);
  }
  toNext() {
    this.activatedIndex$.update((value) => value + 1);
  }
}
