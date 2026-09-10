---
title: "Options Configuration"
---

The PiyingView component takes an `options` property that controls schema conversion and component rendering.

## Basic Structure

```typescript
<piying-view
  [schema]="schema"
  [(model)]="model"
  [options]="options"
></piying-view>
```

```typescript
options = {
  context?: any;                          // context injection
  fieldGlobalConfig?: PiViewConfig;       // global configuration (types + wrappers)
  builder?: typeof FormBuilder<any>;      // custom Builder
};
```

## 1. context

`context` is injected during schema conversion: any Action that can reach `field` can access it through `field.context`:

```typescript
const options = {
  context: { userId: '123', role: 'admin' },
};
```

Using it in the schema:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    actions.hooks.merge({
      allFieldsResolved(field) {
        console.log(field.context.userId); // '123'
        console.log(field.context.role); // 'admin'
      },
    }),
  ),
});
```

## 2. fieldGlobalConfig
- See [fieldGlobalConfig](en/api/global-config/) — types/wrappers actions, priority system and merge rules

`fieldGlobalConfig` is the most important option and consists of `types` and `wrappers`.

### types — type map

Maps type names to concrete components:

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      string:   { type: TextInputComponent },
      number:   { type: NumberInputComponent },
      boolean:  { type: CheckboxComponent },
      object:   { type: PiyingViewGroup },
      array:    { type: PiyingViewGroup },
    },
  },
};
```

### wrappers — wrapper registration

Registers wrapper components that can be referenced from the schema:

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card:     { type: CardWrapperComponent },
      fieldset: { type: FieldsetWrapperComponent },
    },
  },
};
```

### types/wrappers actions and the priority system

When you configure `actions` in `types` or `wrappers`, they become the **default Actions** of that type/wrapper and are **array-merged** with the Actions defined in your schema. Details:

- [fieldGlobalConfig API reference](en/api/global-config/) — types/wrappers actions, priority system, merge rules

## 3. builder (custom Builder)

The built-in `FormBuilder` is used by default; pass a custom class to extend its behaviour:

```typescript
import { FormBuilder } from '@piying/view-angular-core';

class CustomFormBuilder extends FormBuilder<any> {
  // override the conversion logic
}

const options = {
  builder: CustomFormBuilder,
};
```

## Full Options Example

```typescript
options = {
  context: { userId: '123' },
  builder: CustomFormBuilder,
  fieldGlobalConfig: {
    types: {
      string:   { type: TextInputComponent },
      number:   { type: NumberInputComponent },
      custom:   { type: CustomComponent, actions: [v.title('Custom title')] },
    },
    wrappers: {
      card:     { type: CardWrapperComponent },
      fieldset: { type: FieldsetWrapperComponent },
    },
  },
};
```

## Next Steps

- See [fieldGlobalConfig API](en/api/global-config/) — types/wrappers actions, priority system and merge rules
- See [setComponent API](en/api/setcomponent/) — specifying components at the schema level
