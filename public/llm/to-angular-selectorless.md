# 转换Angular组件为Selectorless

- 在html中,将所有内容都包裹到`ng-template`中

```html
<ng-template #templateRef let-attr="attributes">
  <!-- 被包裹内容  -->
</ng-template>
```

- 如果被包裹内容只有一个父级标签,那么还需要加上`[attributes]="attr()"`指令定义

```html
<ng-template #templateRef let-attr="attributes">
  <!-- 被包裹内容的父级标签 -->
  <div [attributes]="attr()"></div>
</ng-template>
```

- 在ts文件中,给类增加`__version`和`templateRef`

```ts
@Component({
  /** */
})
export class InputFCC extends BaseControl {
  // 固定增加
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  /** 其他代码 */
}
```
