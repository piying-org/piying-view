import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('default', () => {
  it('optional', async () => {
    const jsonSchema = {
      type: 'number',
      default: 1,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'number');
    expect(Define.type).toEqual('optional');
    expect((Define as any).default).toEqual(1);
    const result = v.safeParse(Define, undefined);
    expect(result.success).toBeTrue();
    expect(result.output).toEqual(1);
  });
});
