# 在angular下使用皮影(piying)

- 如果要调用皮影组件,首先需要在ts中实现`schema`,`options`,`model`属性
- 然后在`imports`中倒入`PiyingView`
- `schema`表示valibot定义
- `options`用来注册组件使用
- `model`则为输入的数据
- `modelChanged`接收表单变更数据

```ts
import { Component, signal } from '@angular/core';
import * as v from 'valibot';
import { componentClass, NFCSchema, setComponent } from '@piying/view-angular-core';
import { PiyingView, PiyingViewGroup } from '@piying/view-angular';
@Component({
  selector: 'app-root',
  imports: [PiyingView],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  schema = v.object({});
  options = {
    fieldGlobalConfig: {
      types: {},
      wrappers: {},
    },
  };
  model = signal({});
  modelChanged(event: any) {
    console.log(event);
  }
}
```

- 在html中,调用`piying-view`组件

```html
<piying-view [schema]="schema" [options]="options" [model]="model()" (modelChange)="modelChanged($event)"></piying-view>
```
