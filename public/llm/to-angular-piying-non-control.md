# 转换为Angular皮影(piying)非表单控件

尝试将输入的内容转换为Angular皮影表单控件.非表单控件和普通的Angular组件一样

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
import { Component, input, viewChild } from '@angular/core';
import { AttributesDirective } from '@piying/view-angular';

@Component({
  selector: 'app-button',
  templateUrl: './component.html',
  imports: [AttributesDirective],
})
export class ButtonNFCC {
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
  <button class="btn" [class]="attr()?.class" [attributes]="attr()" [excludes]="['class']">{{content()}}</button>
</ng-template>
```

```ts
import { Component, input, viewChild } from '@angular/core';
import { AttributesDirective } from '@piying/view-angular';

@Component({
  selector: 'app-button',
  templateUrl: './component.html',
  imports: [AttributesDirective],
})
export class ButtonNFCC {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  content = input('Default');
}
```
