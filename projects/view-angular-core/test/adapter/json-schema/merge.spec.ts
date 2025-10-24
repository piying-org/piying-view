import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('merge', () => {
  it('const', async () => {
    const jsonSchema = {
      type: 'number',
      allOf: [{ const: 1 }],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'literal');
    let result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(1);
    result = v.safeParse(Define, 2);
    expect(result.success).toBeFalse();
  });
  it('additionalProperties', async () => {
    const jsonSchema = {
      type: 'object',

      allOf: [
        {
          properties: {
            key1: { type: 'number' },
          },
          additionalProperties: false,
        },
      ],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'object');
    let result = v.safeParse(Define, { key1: 1 });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ key1: 1 });
    result = v.safeParse(Define, { key2: 2 });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({});
  });
  it('contains', async () => {
    const jsonSchema = {
      type: 'array',
      allOf: [
        {
          contains: { enum: [1, 2, 3] },
        },
      ],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'array');
    let result = v.safeParse(Define, [1]);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual([1]);
    result = v.safeParse(Define, [4]);
    expect(result.success).toBeFalse();
  });
});
