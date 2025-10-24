import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
import { JsonSchemaDraft04 } from '@hyperjump/json-schema/draft-04';
describe('json-schema-compatible', () => {
  it('exclusiveMinimum/exclusiveMaximum', async () => {
    const jsonSchema = {
      type: 'number',
      minimum: 1,
      maximum: 5,
      exclusiveMinimum: true,
      exclusiveMaximum: true,
    } as JsonSchemaDraft04;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const instance = assertType(Define, 'number');
    let result = v.safeParse(Define, 0);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, 1.1);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, 5);
    expect(result.success).toBeFalse();
  });
  it('exclusiveMinimum/exclusiveMaximum false', async () => {
    const jsonSchema = {
      type: 'number',
      minimum: 1,
      maximum: 5,
      exclusiveMinimum: false,
      exclusiveMaximum: false,
    } as JsonSchemaDraft04;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const instance = assertType(Define, 'number');
    let result = v.safeParse(Define, 0);
    expect(result.success).toBeFalse();
    result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
    result = v.safeParse(Define, 5);
    expect(result.success).toBeTrue();
  });
});
