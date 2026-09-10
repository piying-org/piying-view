import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { FieldLogicGroup } from '@piying/view-angular-core';
import { FormsModule } from '@angular/forms';
import { SelectFCC } from '@piying-lib/angular-daisyui/field-control';
@Component({
  selector: 'app-logic-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet, SelectFCC, FormsModule],
})
export default class LogicFGC extends PiyingViewGroupBase {
  list = computed(() =>
    this.field$$().children!().map((item, index) => ({
      label: item.props()['title'],
      value: index,
    })),
  );

  selectAny$ = signal<number[]>([]);
  selectOr$ = signal<number>(0);

  anyOfChange() {
    const flg = this.field$$().form.control as FieldLogicGroup;

    flg.filterActivateControl$.set((item, index) =>
      this.selectAny$().includes(index),
    );
  }
  oneOfChange() {
    if (typeof this.selectOr$() !== 'number') {
      return;
    }
    const flg = this.field$$().form.control as FieldLogicGroup;
    flg.activateIndex$.set(this.selectOr$()!);
  }
}
