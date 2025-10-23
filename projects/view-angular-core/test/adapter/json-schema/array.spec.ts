import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
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
});
