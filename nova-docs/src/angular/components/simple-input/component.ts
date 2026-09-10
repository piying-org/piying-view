import { Component, forwardRef, input } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '@piying/view-angular';

/**
 * 文档演示用的简单输入控件（V1）。
 * 故意不定义 `static __version = 2`：V1 组件会把 actions.events
 * 自动绑定到宿主元素上（V2 selectorless 模式需要手动设置 events）。
 */
@Component({
  selector: 'demo-simple-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SimpleInputC),
      multi: true,
    },
  ],
  template: `
    <input
      class="input input-sm w-full max-w-xs"
      [placeholder]="placeholder()"
      [disabled]="disabled$()"
      [ngModel]="value$()"
      (ngModelChange)="valueChange($event)"
      (blur)="touchedChange()"
    />
  `,
})
export class SimpleInputC extends BaseControl {
  placeholder = input<string>('');
}
