import { Component, computed, inject } from '@angular/core';
import {
  InsertFieldDirective,
  PI_VIEW_FIELD_TOKEN,
} from '@piying/view-angular';

/** 普通字段 label：优先 title，缺省时回退到字段 key */
@Component({
  selector: 'control-label-wrapper',
  imports: [InsertFieldDirective],
  template: `
    @let label = label$$();

    @if (label) {
      <div [class]="layout$$()">
        <label [class]="labelClass$$()">
          {{ label }}
          @if (required$$()) {
            <span class="text-error">*</span>
          }
        </label>
        <ng-container insertField></ng-container>
      </div>
    } @else {
      <ng-container insertField></ng-container>
    }
  `,
})
export class ControlLabelWC {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  isEnd$$ = computed(() => {
    const position = this.props$$()['labelPosition'] ?? 'top';
    return position === 'bottom' || position === 'end';
  });
  layout$$ = computed(() => {
    const position = this.props$$()['labelPosition'] ?? 'top';
    return position === 'top' || position === 'bottom'
      ? 'flex flex-col gap-1'
      : 'flex items-center gap-2';
  });
  required$$ = computed(
    () => this.field$$().form.control?.required$$() ?? false,
  );
  labelClass$$ = computed(() => {
    const list = ['text-sm', 'font-medium'];
    if (!this.props$$()['title']) {
      list.push('font-mono', 'opacity-70');
    }
    if (this.isEnd$$()) {
      list.push('order-last');
    }
    return list.join(' ');
  });
  label$$ = computed(() => {
    const title = this.props$$()['title'];
    if (title) {
      return title;
    }
    const key = this.field$$().key;
    return typeof key === 'string' ? key : '';
  });
}
