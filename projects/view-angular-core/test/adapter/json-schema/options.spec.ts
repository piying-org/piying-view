import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';
describe('json-schema-options', () => {
  it('afterResolve', async () => {
    const jsonSchema = {
      type: 'number',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema, {
      schemaHandle: {
        afterResolve(jSchema, vSchema) {
          return v.pipe(vSchema, v.title('hello'));
        },
      },
    });
    const instance = assertType(Define, 'number');
    let title = v.getTitle(Define);
    expect(title).toEqual('hello');
  });
  it('type-afterResolve', async () => {
    const jsonSchema = {
      type: 'number',
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema, {
      schemaHandle: {
        type: {
          afterResolve(type, jSchema, vSchema) {
            return v.pipe(vSchema, v.title('hello'));
          },
        },
      },
    });
    const instance = assertType(Define, 'number');
    let title = v.getTitle(Define);
    expect(title).toEqual('hello');
  });
  it('action', async () => {
    const jsonSchema = {
      type: 'number',
      actions: [{ name: 'test', params: [1] }],
    } as JsonSchemaDraft202012Object;
    let useAction = false;
    const Define = jsonSchemaToValibot(jsonSchema, {
      customActions: {
        test: (value: any) => {
          expect(value).toEqual(1);
          useAction = true;
          return v.title('');
        },
      },
    });
    const instance = assertType(Define, 'number');
    v.safeParse(Define, 1);
    expect(useAction).toEqual(true);
  });
  it('action-error', async () => {
    const jsonSchema = {
      type: 'number',
      actions: [{ name: 'test', params: [1] }],
    } as JsonSchemaDraft202012Object;
    try {
      const Define = jsonSchemaToValibot(jsonSchema, {});
      const instance = assertType(Define, 'number');
      v.safeParse(Define, 1);
    } catch (error) {
      expect(error instanceof Error).toBeTrue();
      return
    }
    throw new Error('');
  });
});
