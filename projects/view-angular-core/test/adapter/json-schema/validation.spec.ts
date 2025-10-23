import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema-validation', () => {
  it('string-length', async () => {
    const jsonSchema = {
      type: 'string',
      minLength: 1,
      maxLength: 5,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    let result = v.safeParse(Define, '');
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, '1');
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, '1'.repeat(6));
    expect(result.success).toBeFalse();
  });
  it('number-value', async () => {
    const jsonSchema = {
      type: 'number',
      minimum: 1,
      maximum: 5,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'number');
    let result = v.safeParse(Define, 0);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, 6);
    expect(result.success).toBeFalse();
  });
  it('number-value2', async () => {
    const jsonSchema = {
      type: 'number',
      exclusiveMinimum: 1,
      exclusiveMaximum: 5,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'number');
    let result = v.safeParse(Define, 0);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, 1.1);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, 5);
    expect(result.success).toBeFalse();
  });
  it('number-multipleOf', async () => {
    const jsonSchema = {
      type: 'number',
      multipleOf: 3,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'number');
    let result = v.safeParse(Define, 2);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, 3);
    expect(result.success).toBeTrue();
  });
  it('array-length', async () => {
    const jsonSchema = {
      type: 'array',
      minItems: 1,
      maxItems: 5,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'array');
    let result = v.safeParse(Define, []);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, [1]);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, new Array(6));
    expect(result.success).toBeFalse();
  });

  it('string-pattern', async () => {
    const jsonSchema = {
      type: 'string',
      pattern: '[a-z]+',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    let result = v.safeParse(Define, '1');
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, 'aa');
    expect(result.success).toBeTrue();
  });
  // it('string-format-date-time', async () => {
  //   const jsonSchema = {
  //     type: 'string',
  //     format: 'date-time',
  //   } as JsonSchemaDraft202012Object;
  //   const Define = jsonSchemaToValibot(jsonSchema);
  //   const instance = assertType(Define, 'string');
  //   let result = v.safeParse(Define, '2018-11-13T20:20:39+00:00');
  //   expect(result.success).toBeTrue();
  // });
  // it('string-format-time', async () => {
  //   const jsonSchema = {
  //     type: 'string',
  //     format: 'time',
  //   } as JsonSchemaDraft202012Object;
  //   const Define = jsonSchemaToValibot(jsonSchema);
  //   const instance = assertType(Define, 'string');
  //   let result = v.safeParse(Define, '20:20:39+00:00');
  //   expect(result.success).toBeTrue();
  // });
  it('string-format-date', async () => {
    const jsonSchema = {
      type: 'string',
      format: 'date',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, '2018-11-13');
    expect(result.success).toBeTrue();
  });
  it('string-format-email', async () => {
    const jsonSchema = {
      type: 'string',
      format: 'email',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, 'a@a.com');
    expect(result.success).toBeTrue();
  });
  it('string-format-ipv4', async () => {
    const jsonSchema = {
      type: 'string',
      format: 'ipv4',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, '1.1.1.1');
    expect(result.success).toBeTrue();
  });
  it('string-format-ipv6', async () => {
    const jsonSchema = {
      type: 'string',
      format: 'ipv6',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, '2001:db8::8a2e:370:7334');
    expect(result.success).toBeTrue();
  });
  it('string-format-uuid', async () => {
    const jsonSchema = {
      type: 'string',
      format: 'uuid',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6');
    expect(result.success).toBeTrue();
  });
  it('string-format-uri', async () => {
    const jsonSchema = {
      type: 'string',
      format: 'uri',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, 'abc:1234');
    expect(result.success).toBeTrue();
  });
  it('array-item', async () => {
    const jsonSchema = {
      type: 'array',
      uniqueItems: true,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'array');
    let result = v.safeParse(Define, [1, 1]);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, [1]);
    expect(result.success).toBeTrue();
  });
  it('object-item', async () => {
    const jsonSchema = {
      type: 'object',
      minProperties: 1,
      maxProperties: 2,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, {});
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, { a: 1 });
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, { a: 1, b: 1, c: 2 });
    expect(result.success).toBeFalse();
  });
  it('metadata', async () => {
    const jsonSchema = {
      type: 'string',
      title: 'title1',
      description: 'description1',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'string');
    const result = v.safeParse(Define, '1');
    expect(result.success).toBeTrue();
    expect(v.getTitle(Define)).toEqual('title1');
    expect(v.getDescription(Define)).toEqual('description1');
  });
});
