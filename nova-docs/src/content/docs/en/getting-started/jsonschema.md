---
title: "JSON Schema Support"
---



> 🧪 Experimental feature

> JSON Schema support works by converting the input into a Valibot schema, which Piying-View then parses as usual.

## Overview

Piying-View provides the `jsonSchemaToValibot` function, converting [JSON Schema](https://json-schema.org/) (Draft-04, Draft-07 and Draft 2020-12) into a Valibot schema:

```typescript
import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';

const valibotSchema = jsonSchemaToValibot(jsonSchema);
// after conversion it is used exactly like a regular Piying-View schema
```

## Supported Type Mappings

### Primitive Types

| JSON Schema type | Valibot equivalent |
| ---------------- | ------------- |
| `string`         | `v.string()`  |
| `number`         | `v.number()`  |
| `integer`        | `v.integer()` |
| `boolean`        | `v.boolean()` |
| `null`           | `v.null()`    |
| `any` / no type   | `v.any()`        |

### Constraints

| JSON Schema                   | Valibot conversion                    |
| ----------------------------- | ------------------------------------ |
| `type: "string"`, `minLength` | `v.pipe(v.string(), v.minLength(N))` |
| `type: "number"`, `minimum`   | `v.pipe(v.number(), v.minValue(N))`  |
| `type: "integer"`, `minimum`  | `v.pipe(v.integer(), v.minValue(N))` |
| `enum: ["a", "b"]`            | `v.picklist(["a", "b"])`             |
| `const: 1`                    | `v.literal(1)`                       |

### Object Types

| JSON Schema structure                 | Valibot equivalent                                   |
| ------------------------------------ | ----------------------------------------------------- |
| `properties` + `required`             | `v.object()` (required fields marked automatically)   |
| `properties` (no required)            | `v.looseObject()`                                   |
| `prefixItems`                        | `v.tuple()` / `v.looseTuple()` / `v.tupleWithRest()` |
| no properties + additionalProperties  | `v.record()`                                         |

### Array Types

| JSON Schema structure              | Valibot equivalent                |
| ------------------------------- | --------------------------------- |
| `items` (not an array)              | `v.array(itemsSchema)`            |
| `items` (array, with uniqueItems)   | `v.array(itemsSchema)` + uniqueness constraint |

### Logical Composition

| JSON Schema    | Valibot equivalent         |
| -------------- | ------------------------- |
| `oneOf`        | `v.union()` (`oneOf-condition` component) |
| `anyOf`        | `v.intersect()` + `v.union()` (`anyOf-condition` component) |
| `allOf`        | `v.intersect()`           |
| `if/then/else` | `v.pipe()` + conditional logic |

## Limitations

### Deadlock Detection

The input must not contain deadlocks (a field that can never pass validation counts as one):

```json
{
  "propertyNames": false,
  "properties": { "a": { "type": "string" } },
  "required": ["a"]
}
```

### Priority Rules

When `const` / `enum` is present it is converted first and other validations are ignored:

```json
{
  // ✅ enum takes precedence
  "enum": [1, 2, 3],
  // 🚫 type is ignored
  "type": "string"
}
```

### Mutually Exclusive Patterns

A schema may contain **only one** of `allOf` / `oneOf` / `anyOf` / `if/then/else` (`not` is exempt from this rule):

```json
// ❌ several combination keywords together are not allowed
{ "allOf": [], "oneOf": [] }

// ✅ use only one
{ "allOf": [] }
```

### Nesting Limits

Sub-schemas of `allOf` / `oneOf` / `anyOf` / `if/then/else` **cannot** nest further sub-schemas:

```json
{
  "allOf": [
    {
      // ❌ anyOf nested inside allOf is not allowed
      "anyOf": []
    }
  ]
}
```

### Reference Limits

`$ref` is **single-file only**; remote references are unsupported.

## Component Mapping for Group Types

Piying-View picks a rendering strategy automatically from the JSON Schema structure:

### oneOf-condition / anyOf-condition

**When to use**: when the sub-schemas share the same fields.

```json
{
  "oneOf": [
    {
      "properties": {
        "cond1": { "const": 1 },
        "value1": { "type": "string" }
      },
      "required": ["cond1"]
    },
    {
      "properties": {
        "cond1": { "const": 2 },
        "value2": { "type": "string" }
      },
      "required": ["cond1"]
    }
  ]
}
```

### oneOf-select / anyOf-select

**When to use**: when the component must let the user pick one or several sub-conditions manually.

```json
{
  "oneOf": [
    {
      "title": "item1",
      "properties": {
        "value1": { "type": "string" }
      }
    },
    {
      "title": "item2",
      "properties": {
        "value2": { "type": "string" }
      }
    }
  ]
}
```

### object Variants

| JSON Schema                 | Mapping                                          |
| --------------------------- | ---------------------------------------------- |
| `properties` + `required`   | `v.object()` (strict mode)                        |
| `properties` (no required)  | `v.looseObject()` (keeps undefined keys)         |
| object with rest            | `objectWithRest` / `intersect`                    |

### tuple Variants

| JSON Schema                             | Mapping                              |
| --------------------------------------- | ------------------------------------- |
| `prefixItems` + no additionalItems       | `v.tuple()` (fixed length, extras filtered) |
| `prefixItems` + `additionalItems: true`  | `v.looseTuple()` (keeps the extra items) |
| Partial fixed + rest                      | `v.tupleWithRest()`                   |

### intersect / union

This can be treated as a regular object type, mainly for validation.

## Select-Type Components

These types pass an `options` input property to the component automatically; the component must render the options:

| JSON Schema                                       | Valibot        | Component type         | Notes                          |
| ------------------------------------------------- | -------------- | -------------------- | ------------------------------ |
| `"enum": ["1", "2"]`                              | `v.picklist()` | from type mapping    | Single choice                  |
| `"items": { "enum": [...] }, "uniqueItems": true` | `v.array()`    | `multiselect`        | Multiple choice, **no** repeats |
| `"items": { "enum": [...] }` (no `uniqueItems`)   | `v.array()`    | `multiselect-repeat` | Multiple choice, repeats allowed |
| `"type": "number", "minimum": N`                  | `v.number()`   | from type mapping    | Number input                   |

> ⚠️ The multi-select component name is decided directly by `uniqueItems`: `uniqueItems ? 'multiselect' : 'multiselect-repeat'`. So **`uniqueItems` present means the non-repeatable `multiselect`**, while omitting it yields the repeatable `multiselect-repeat`. The multi-select branch also adds `asControl()` and a `multiple: true` input.

## Custom Actions

### Built-in Actions

Define an `actions` field in the JSON Schema to use the built-in Piying-View Actions:

```json
{
  "type": "string",
  "title": "Select 4: Radio button",
  "enum": ["Option 1", "Option 2", "Option 3"],
  "actions": [
    {
      "name": "setComponent",
      "params": ["radio"]
    }
  ]
}
```

### Custom Actions

Custom actions in the JSON Schema must be registered through the second argument of `jsonSchemaToValibot`, `customActions`:

```json
{
  "type": "string",
  "actions": [
    {
      "name": "testTitle",
      "params": []
    }
  ]
}
```

```typescript
import * as v from 'valibot';
import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';

const schema = jsonSchemaToValibot(jsonSchema, {
  customActions: {
    // the key matches actions[].name in the JSON; params are spread as function arguments
    testTitle: () => v.title('test title'),
  },
});
```

## Full Example

```typescript
import * as v from 'valibot';
import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { PiyingView, BaseControl, PiyingViewGroup } from '@piying/view-angular';

// JSON Schema definition
const jsonSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, title: 'Username' },
    age: { type: 'integer', minimum: 0, maximum: 150, title: 'Age' },
    role: { type: 'string', enum: ['admin', 'user'], title: 'Role' },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        street: { type: 'string' },
      },
      required: ['city'],
    },
  },
  required: ['username', 'age'],
};

// convert to a Valibot schema
const schema = jsonSchemaToValibot(jsonSchema);

// from here on everything works exactly like a regular Piying-View schema
```
