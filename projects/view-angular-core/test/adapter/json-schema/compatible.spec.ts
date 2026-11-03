import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { assertType } from './util/assert-type';
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
  it('type-array-null', async () => {
    // type 数组里的 null 是「值可为 null」，不是「可缺失」，必须走 nullable
    const Define = jsonSchemaToValibot({
      type: ['null', 'string'],
    } as any);
    expect(v.safeParse(Define, null).success).toBeTrue();
    expect(v.safeParse(Define, 'abc').success).toBeTrue();
    expect(v.safeParse(Define, 123).success).toBeFalse();
  });
  it('type-array-null-with-constraints', async () => {
    const Define = jsonSchemaToValibot({
      type: ['null', 'number'],
      minimum: 5,
    } as any);
    expect(v.safeParse(Define, null).success).toBeTrue();
    expect(v.safeParse(Define, 1).success).toBeFalse();
    expect(v.safeParse(Define, 5).success).toBeTrue();
  });
  it('guess-array-by-min-items', async () => {
    // 无 type 时 minItems/maxItems 也是 array 的推断线索
    const Define = jsonSchemaToValibot({ minItems: 2 } as any);
    expect(assertType(Define, 'array').type).toEqual('array');
    expect(v.safeParse(Define, ['a']).success).toBeFalse();
    expect(v.safeParse(Define, ['a', 'b']).success).toBeTrue();
  });
});
