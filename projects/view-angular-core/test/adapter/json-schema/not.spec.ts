import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema-not', () => {
  it('not', async () => {
    const jsonSchema = {
      not: {
        properties: {
          k1: { type: 'number' },
        },
        required: ['k1'],
      },
      type: 'object',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, { k2: 1 });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ k2: 1 });
    result = v.safeParse(Define, { k1: 1 });
    expect(result.success).toBeFalse();
  });
  it('not-impasse', async () => {
    const jsonSchema = {
      not: true,
      type: 'object',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    const result = v.safeParse(Define, { k2: 1 });
    expect(result.success).toBeFalse();
    expect(result.issues![0].message).toContain('impasse:not');
  });
});
