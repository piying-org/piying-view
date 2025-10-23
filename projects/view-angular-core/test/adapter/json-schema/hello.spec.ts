import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema', () => {
  it('hello', () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        s1: { type: 'string' },
        n1: { type: 'number' },
        n2: { type: 'integer' },
        b1: { type: 'boolean' },
        a1: { type: 'array' },
        nu1: { type: 'null' },
        o1: { type: 'object' },
      },
    } as const;
    const result = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(result, 'loose_object');
    expect(Object.keys(instance.entries).length).toEqual(7);
    assertType(instance.entries['s1'], 'string');
    assertType(instance.entries['n1'], 'number');
    assertType(instance.entries['n2'], 'number');
    assertType(instance.entries['b1'], 'boolean');
    assertType(instance.entries['a1'], 'array');
    assertType(instance.entries['nu1'], 'null');
    assertType(instance.entries['o1'], 'loose_object');
  });

  it('array-prefix', async () => {
    const jsonSchema = {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'string' }],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const input = [1, '1', 1];
    const instance = assertType(Define, 'loose_tuple');

    const result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(input);
  });
  it('array-fix', async () => {
    const jsonSchema = {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'string' }],
      items: false,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    let input = [1, '1', 1];
    const instance = assertType(Define, 'tuple');
    let result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual([1, '1']);
    input = [1, '1'];
    result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(input);
  });
  it('tuple-loose', async () => {
    const jsonSchema = {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'string' }],
      items: { type: 'string' },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    let input = [1, '1', '1'];
    const instance = assertType(Define, 'tuple_with_rest');
    let result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(input);
    input = [1, '1'];
    result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(input);
  });
  it('array', async () => {
    const jsonSchema = {
      type: 'array',
      items: { type: 'string' },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    let input = ['1', '2', '3'] as any;
    const instance = assertType(Define, 'array');
    let result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(input);
    input = [1, '1'];
    result = v.safeParse(Define, input);
    expect(result.success).toBeFalse();
  });
  it('array-contain', async () => {
    const jsonSchema = {
      type: 'array',
      items: { type: 'string' },
      contains: { const: '1' },
      maxContains: 2,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    let input = ['1', '2', '3'] as any;
    const instance = assertType(Define, 'array');
    let result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(input);
    input = ['2', '3'];
    result = v.safeParse(Define, input);
    expect(result.success).toBeFalse();
    input = ['1', '1', '2', '3'];
    result = v.safeParse(Define, input);
    expect(result.success).toBeTrue();
    input = ['1', '1', '1', '2', '3'];
    result = v.safeParse(Define, input);
    expect(result.success).toBeFalse();
  });
  it('const', async () => {
    const jsonSchema = {
      const: 1,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'literal');
    let result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(1);
    result = v.safeParse(Define, 2);
    expect(result.success).toBeFalse();
  });
  it('null-type', async () => {
    const jsonSchema = {
      type: ['number', 'null'],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'number');
    let result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(1);
    result = v.safeParse(Define, undefined);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, 'undefined');
    expect(result.success).toBeFalse();
  });
  it('null', async () => {
    const jsonSchema = {
      type: 'null',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'null');
    let result = v.safeParse(Define, null);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, 1);
    expect(result.success).toBeFalse();
  });
  it('array-enum', async () => {
    const jsonSchema = {
      items: { enum: [1, 2] },
      type: ['array'],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'array');
    let result = v.safeParse(Define, [1, 2]);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual([1, 2]);
    result = v.safeParse(Define, [3]);
    expect(result.success).toBeFalse();
  });
  it('object-true', async () => {
    const jsonSchema = {
      properties: {
        k1: { type: 'number' },
        k2: true,
      },
      additionalProperties: false,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'object');
    let result = v.safeParse(Define, { k1: 1, k2: '' });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ k1: 1, k2: '' });
    result = v.safeParse(Define, { k1: 1, k2: false });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ k1: 1, k2: false });
  });
  it('object-false', async () => {
    const jsonSchema = {
      properties: {
        k1: { type: 'number' },
        k2: false,
      },
      additionalProperties: false,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'object');
    let result = v.safeParse(Define, { k1: 1, k2: '' });
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, { k1: 1 });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ k1: 1 });
    result = v.safeParse(Define, { k1: 1, k2: undefined });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ k1: 1, k2: undefined });
  });
});
