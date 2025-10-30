# 转换为Angular皮影(piying)表单控件

尝试将输入的内容转换为Angular皮影表单控件.表单控件与Angular的自定义表单相似

## 模板

- html的内容需要包裹在`ng-template`标签内
- html内容外层如果是只有一个标签,那么需要在这个标签上加上指令`[attributes]="attr()"` 如果已经有class属性那么还需要加上`[excludes]="['class']"`
- ts的`XXX`名字需要根据输入内容猜测实现
- 部分变量需要根据输入内容猜测提取

```html
<ng-template #templateRef let-attr="attributes">
  <!-- 控件内容 -->
</ng-template>
```

```ts
import { Component, forwardRef, viewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AttributesDirective, BaseControl } from '@piying/view-angular';
@Component({
  selector: 'app-xxx',
  templateUrl: './component.html',
  imports: [FormsModule, AttributesDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => XXXFCC),
      multi: true,
    },
  ],
})
export class XXXFCC extends BaseControl {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
```

## 例子1

### 输入

```html
<input type="text" placeholder="Type here" class="input" />
```

### 输出

```html
<ng-template #templateRef let-attr="attributes">
  <input [attributes]="attr()" [excludes]="['class']" type="text" class="input" [class]="attr()?.class" [ngModel]="value$()" (ngModelChange)="valueChange($event)" [disabled]="disabled$()" />
</ng-template>
```

```ts
import { Component, forwardRef, viewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AttributesDirective, BaseControl } from '@piying/view-angular';
@Component({
  selector: 'app-input',
  templateUrl: './component.html',
  imports: [FormsModule, AttributesDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFCC),
      multi: true,
    },
  ],
})
export class InputFCC extends BaseControl {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
```
