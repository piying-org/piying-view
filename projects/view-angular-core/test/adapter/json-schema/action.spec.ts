import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import { createBuilder } from '../../util/create-builder';
describe('action', () => {
  it('actions', async () => {
    const jsonSchema = {
      type: 'number',
      actions: [{ name: 'actions.inputs.patch', params: [{ value: 1 }] }],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    let result = createBuilder(Define as any);
    expect(result.inputs()).toEqual({ value: 1 });
  });
});
