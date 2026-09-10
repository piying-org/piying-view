import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'array-rw',
  templateUrl: './component.html',
  imports: [MatIcon, NgTemplateOutlet],
})
export default class ArrayRWComponent extends PiyingViewGroupBase {
  initItem = input<(index: number | undefined) => any>();
  minLength = input<number>();
  fixedLength = input<number>();
  isFixedLength$$ = computed(() => typeof this.fixedLength() === 'number');
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minLength']) {
      const minLength = this.minLength() ?? 0;
      for (
        let i = (this.field$$().children!() || []).length;
        i < minLength;
        i++
      ) {
        this.field$$().action.set(this.initItem()?.(i), i);
      }
    }
    if (changes['fixedLength']) {
      const fixedLength = this.fixedLength() ?? 0;
      const currentLength = (this.field$$().children!() || []).length;

      if (currentLength < fixedLength) {
        for (let i = currentLength; i < fixedLength; i++) {
          this.field$$().action.set(this.initItem()?.(i), i);
        }
      } else if (currentLength > fixedLength) {
        for (let i = fixedLength; i < currentLength; i++) {
          this.field$$().action.remove(fixedLength);
        }
      }
    }
  }
  remove(index: number) {
    this.field$$().action.remove(index);
  }
  add() {
    this.field$$().action.set(this.initItem()?.(undefined));
  }
}
