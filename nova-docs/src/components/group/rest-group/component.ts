import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal, viewChild } from '@angular/core';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { isFieldGroup } from '@piying/view-angular-core';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'rest-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet, MatIcon, FormsModule],
})
export default class RestGroup extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  addKey$ = signal('');
  wrapperClass = input<any>('flex flex-col gap-4');

  add() {
    if (this.isGroup$$()) {
      this.field$$().action.set(undefined, this.addKey$());
      this.addKey$.set('');
    } else {
      this.field$$().action.set(undefined);
    }
  }
  remove(index: number) {
    if (this.isGroup$$()) {
      const item = this.field$$().restChildren!()[index];
      this.field$$().action.remove(item.keyPath!.slice(-1)[0]);
    } else {
      this.field$$().action.remove(index);
    }
  }
  isGroup$$ = computed(() => isFieldGroup(this.field$$().form.control));
  hasChild$$ = computed(
    () =>
      !!this.field$$().fixedChildren?.().length ||
      !!this.field$$().restChildren?.().length,
  );
}
