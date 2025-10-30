# 转换为Angular皮影(piying)表单控件组

尝试将输入的内容转换为Angular皮影表单控件组.表单控件组可以包裹多个子控件

## 模板

- html的内容需要包裹在`ng-template`标签内
- 需要提取的是输入的包裹层,而不是里面的内容,里面的内容为子级控件
- html内容外层如果是只有一个标签,那么需要在这个标签上加上指令`[attributes]="attr()"` 如果已经有class属性那么还需要加上`[excludes]="['class']"`
- ts的`XXX`名字需要根据输入内容猜测实现
- 部分变量需要根据输入内容猜测提取

```html
<ng-template #templateRef let-attr="attributes">
  <!-- 控件内容 -->
</ng-template>
```

```ts
import { NgTemplateOutlet } from '@angular/common';
import { Component, viewChild } from '@angular/core';

import { AttributesDirective, PiyingViewGroupBase } from '@piying/view-angular';
@Component({
  selector: 'app-xxx',
  templateUrl: './component.html',
  imports: [AttributesDirective, NgTemplateOutlet],
})
export class XXXFGC extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
```

## 例子1

- 通用显示型控件组

## 输入

```html
<div class="navbar bg-base-100 shadow-sm">
  <a class="btn btn-ghost text-xl">daisyUI</a>
</div>
```

```html
<ng-template #templateRef let-attr="attributes">
  <div class="navbar bg-base-100 shadow-sm" [attributes]="attr()" [excludes]="['class']" [class]="attr()?.class">
    @for (field of children$$(); track field.id || $index) {
    <ng-container *ngTemplateOutlet="fieldTemplateRef(); context: { $implicit: field }"></ng-container>
    }
  </div>
</ng-template>
```

```ts
import { NgTemplateOutlet } from '@angular/common';
import { Component, viewChild } from '@angular/core';

import { AttributesDirective, PiyingViewGroupBase } from '@piying/view-angular';
@Component({
  selector: 'app-navbar',
  templateUrl: './component.html',
  imports: [AttributesDirective, NgTemplateOutlet],
})
export class NavbarFGC extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
```
