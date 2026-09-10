---
title: "Utilities — typedComponent / convertToField and More"
---

This page documents the utilities and classes provided by `@piying/view-angular`: `typedComponent` / `nfcComponent`, `convertToField`, `NgSchemaHandle` / `AngularFormBuilder`, and `actions.directives`.

## typedComponent — strongly typed setComponent

Derives `inputs` / `outputs` types from the component's `@Input()` / `@Output()`. Returns `{ define, setComponent, nfcComponent }`:

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
    actions.inputs.patch({ placeholder: 'Please enter' }),
    actions.outputs.set({ change: handleChange }),
  ]),
});
```

- The returned `setComponent(key, fn)` wraps `setComponent` plus the Actions returned by `fn(actions)` and produces `metadataList`.
- The returned `nfcComponent(key, fn)` produces a `v.pipe` schema based on `NFCSchema` (non-form control).
- Inference rules: input types come from `InputSignal` / `InputSignalWithTransform` on the component instance, output types from `OutputEmitterRef`.

## convertToField — converting a schema

Converts a Valibot schema into a resolved field configuration:

```typescript
import { convertToField } from '@piying/view-angular';

const field = convertToField(schema, envInjector, options);
```

It is an instance of `createConvertToField({ builder: AngularFormBuilder, handle: NgSchemaHandle })`.

## NgSchemaHandle / AngularFormBuilder

```typescript
import { NgSchemaHandle, AngularFormBuilder } from '@piying/view-angular';

// NgSchemaHandle — Angular schema handle, extends CoreSchemaHandle, includes directives = combineSignal<NgDirectiveConfig>([])
// AngularFormBuilder — Angular FormBuilder, extends FormBuilder<NgSchemaHandle>, @Injectable()
```

`AngularFormBuilder.afterResolveConfig` assigns `config.directives = field.directives` to the resolved field configuration.

## actions.directives — directive Actions

`actions.directives` attaches custom directives to a field (directive configuration):

```typescript
import { actions } from '@piying/view-angular';
import { MyDirective } from './my.directive';

const schema = v.pipe(
  v.string(),
  actions.directives.set([
    { type: MyDirective, inputs: { color: 'red' } },
  ]),
);

// available operations: set / patch / patchAsync / remove
```

`actions = { ...coreActions, directives }`, where `directives` provides `set` / `patch` / `patchAsync` / `remove`.

See [Field Directive Configuration](en/angular/field-directives/) for detailed usage.

## Related Documents

- [Angular API Reference](en/angular/api/) — index of all public APIs
- [Field Directive Configuration](en/angular/field-directives/) — detailed directive behaviour
