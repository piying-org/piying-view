import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('recursive', () => {
  it('array', async () => {
    const jsonSchema = {
      definitions: {
        node: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/definitions/node',
              },
            },
          },
        },
      },
      $ref: '#/definitions/node',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, { name: '', children: [] });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ name: '', children: [] });
    result = v.safeParse(Define, {
      name: '',
      children: [{ name: '1', children: [] }],
    });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({
      name: '',
      children: [{ name: '1', children: [] }],
    });
  });
  it('object', async () => {
    const jsonSchema = {
      definitions: {
        node: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            left: {
              $ref: '#/definitions/node',
            },
            right: {
              $ref: '#/definitions/node',
            },
          },
        },
      },
      $ref: '#/definitions/node',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'loose_object');
    let result = v.safeParse(Define, { name: '' });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({ name: '' });
    result = v.safeParse(Define, {
      name: '',
      left: { name: '11' },
    });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({
      name: '',
      left: { name: '11' },
    });
    result = v.safeParse(Define, {
      name: '',
      left: { name: '11' },
      right: { name: '22' },
    });
    expect(result.success).toBeTrue();
    expect(result.output).toEqual({
      name: '',
      left: { name: '11' },
      right: { name: '22' },
    });
  });
});
