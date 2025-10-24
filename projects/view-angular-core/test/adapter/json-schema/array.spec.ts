import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
import { JsonSchemaDraft07 } from '@hyperjump/json-schema/draft-07';
describe('json-schema-array', () => {
  it('items-true', async () => {
    const jsonSchema = {
      type: 'array',
      items: true,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'array');
    const result = v.safeParse(Define, [1]);
    expect(result.success).toBeTrue();
  });
  it('items-false', async () => {
    const jsonSchema = {
      type: 'array',
      items: false,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'tuple');
    const result = v.safeParse(Define, [1]);
    expect(result.output).toEqual([]);
  });
  it('compatiable', async () => {
    const jsonSchema = {
      type: 'array',
      items: [
        {
          type: 'number',
        },
        {
          type: 'boolean',
        },
      ],
      additionalItems: {
        type: 'string',
      },
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const instance = assertType(Define, 'tuple_with_rest');
    const result = v.safeParse(Define, [1, true, '1']);
    expect(result.output).toEqual([1, true, '1']);
  });
});
