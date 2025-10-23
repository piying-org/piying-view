import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema-object', () => {
  it('dependentRequired', async () => {
    const jsonSchema = {
      dependentRequired: {
        foo: ['bar', 'baz'],
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, { other: '' });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { foo: '' });
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, { foo: '', bar: '' });
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, { foo: '', baz: '', bar: '' });
    expect(result.success).toBeTrue();
  });
  it('dependentSchemas', async () => {
    const jsonSchema = {
      dependentSchemas: {
        foo: { maxProperties: 2 },
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'intersect');

    let result = v.safeParse(Define, { other: '', other2: '', other3: '' });

    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { foo: '' });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { foo: '', bar: '' });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { foo: '', baz: '', bar: '' });
    expect(result.success).toBeFalse();
  });

  it('only-additionalProperties', async () => {
    const jsonSchema = {
      additionalProperties: {
        type: 'string',
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'object_with_rest');
    let result = v.safeParse(Define, { a: '' });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { a: 1 });
    expect(result.success).toBeFalse();
  });

  it('propertyNames', async () => {
    const jsonSchema = {
      propertyNames: {
        pattern: '^[a-z]+$',
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, { a: '' });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { a1: 1 });
    expect(result.success).toBeFalse();
  });
  it('patternProperties1', async () => {
    const jsonSchema = {
      patternProperties: {
        abc: { type: 'number' },
      },
      additionalProperties: {
        type: 'string',
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'object_with_rest');
    let result = v.safeParse(Define, { a: '1' });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { abc: 1 });    
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { dd: 1 });
    expect(result.success).toBeFalse();
  });
});
