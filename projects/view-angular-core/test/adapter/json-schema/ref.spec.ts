import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema-ref', () => {
  it('ref', async () => {
    const jsonSchema = {
      definitions: {
        define1: {
          type: 'object',
          properties: {
            sub1: {
              type: 'string',
            },
          },
        },
      },
      type: 'object',
      properties: {
        ref1: {
          title: 'title1',
          $ref: '#/definitions/define1',
        },
        data: {
          type: 'string',
        },
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, { data: '1', ref1: { sub1: '' } });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ data: '1', ref1: { sub1: '' } });
    result = v.safeParse(Define, { data: '1', ref1: 1 });
    expect(result.success).toBeFalse();
  });
});
