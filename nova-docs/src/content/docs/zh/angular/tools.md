---
title: "工具函数 — typedComponent / convertToField 等"
---

本文介绍 `@piying/view-angular` 提供的工具函数与类：`typedComponent` / `nfcComponent`、`convertToField`、`NgSchemaHandle` / `AngularFormBuilder`，以及 `actions.directives`。

## typedComponent — 强类型 setComponent

基于组件 `@Input()` / `@Output()` 推导 `inputs` / `outputs` 类型。返回 `{ define, setComponent, nfcComponent }`：

```typescript
import { typedComponent } from '@piying/view-angular';
import { MyInputComponent } from './my-input.component';

const typeDefine = typedComponent({
  types: {
    string: { type: MyInputComponent },
  },
});

const schema = v.object({
  name: typeDefine.setComponent('string', (actions) => [
    actions.inputs.patch({ placeholder: '请输入' }),
    actions.outputs.set({ change: handleChange }),
  ]),
});
```

- 返回的 `setComponent(key, fn)` 会包装 `setComponent` + 由 `fn(actions)` 返回的 Actions 列表，生成 `metadataList`。
- 返回的 `nfcComponent(key, fn)` 基于 `NFCSchema`（非表单控件）生成 `v.pipe` Schema。
- 推导规则：从组件实例的 `InputSignal` / `InputSignalWithTransform` 推导 inputs 类型，从 `OutputEmitterRef` 推导 outputs 类型。

## convertToField — 转换 Schema

将 Valibot Schema 转换为已解析的字段配置：

```typescript
import { convertToField } from '@piying/view-angular';

const field = convertToField(schema, envInjector, options);
```

它是 `createConvertToField({ builder: AngularFormBuilder, handle: NgSchemaHandle })` 的实例。

## NgSchemaHandle / AngularFormBuilder

```typescript
import { NgSchemaHandle, AngularFormBuilder } from '@piying/view-angular';

// NgSchemaHandle — Angular 的 Schema 处理句柄，继承 CoreSchemaHandle，含 directives = combineSignal<NgDirectiveConfig>([])
// AngularFormBuilder — Angular 的 FormBuilder，继承 FormBuilder<NgSchemaHandle>，@Injectable()
```

`AngularFormBuilder.afterResolveConfig` 会把 `config.directives = field.directives` 赋给解析后的字段配置。

## actions.directives — 指令 Actions

`actions.directives` 为字段附加自定义指令（指令配置）：

```typescript
import { actions } from '@piying/view-angular';
import { MyDirective } from './my.directive';

const schema = v.pipe(
  v.string(),
  actions.directives.set([
    { type: MyDirective, inputs: { color: 'red' } },
  ]),
);

// 可用操作：set / patch / patchAsync / remove
```

`actions = { ...coreActions, directives }`，其中 `directives` 提供 `set` / `patch` / `patchAsync` / `remove`。

详细使用见 [字段指令配置](zh/angular/field-directives/)。

## 相关文档

- [Angular API 参考](zh/angular/api/) — 全部公开 API 索引
- [字段指令配置](zh/angular/field-directives/) — 指令配置详细行为
