import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema-fixedlist', () => {
  it('const-list', async () => {
    const jsonSchema = {
      oneOf: [
        { const: 1, title: 'label1' },
        { const: 2, title: 'label2' },
      ],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'picklist');
    const result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
  });
  it('const-enum', async () => {
    const jsonSchema = {
      title: 'title1',
      oneOf: [
        { enum: [1], title: 'label1' },
        { enum: [2], title: 'label2' },
      ],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    expect(v.getTitle(Define)).toEqual('title1');
    const instance = assertType(Define, 'picklist');
    const result = v.safeParse(Define, 1);
    expect(result.success).toBeTrue();
  });
  it('const-enum2', async () => {
    const jsonSchema = {
      oneOf: [{ enum: [1, 2] }, { enum: [3, 4] }],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'picklist');
    const result = v.safeParse(Define, 2);
    expect(result.success).toBeTrue();
  });
});
