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
    // items: false 意味着不允许任何元素，必须判非法而不是静默截断
    assertType(Define, 'strict_tuple');
    expect(v.safeParse(Define, []).success).toBeTrue();
    expect(v.safeParse(Define, [1]).success).toBeFalse();
  });
  it('draft07-items-schema', async () => {
    // draft-07 6.4.1：items 为单 schema 时约束所有元素，不得误当元组搬到 prefixItems
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema',
      type: 'array',
      items: { type: 'string' },
    } as any);
    const instance = assertType(Define, 'array');
    expect(instance.item.type).toEqual('string');
    expect(v.safeParse(Define, ['a', 'b']).success).toBeTrue();
    expect(v.safeParse(Define, ['a', 1]).success).toBeFalse();
  });
  it('draft07-schema-uri-no-hash', async () => {
    // $schema 尾部 # 缺失不影响草案判定（Angular CLI 就是这种写法）
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema',
      type: 'array',
      items: { type: 'string' },
    } as any);
    expect(assertType(Define, 'array').item.type).toEqual('string');
  });
  it('draft07-items-empty-with-additional', async () => {
    // items: [] 不约束任何位置，additionalItems 作用于全部元素
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: [],
      additionalItems: { type: 'string' },
    } as any);
    expect(assertType(Define, 'array').item.type).toEqual('string');
    expect(v.safeParse(Define, ['a', 'b']).success).toBeTrue();
  });
  it('draft07-additional-items-ignored', async () => {
    // draft-07 6.4.2：items 不是数组时 additionalItems MUST be ignored
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: { type: 'string' },
      additionalItems: false,
    } as any);
    expect(assertType(Define, 'array').item.type).toEqual('string');
    expect(v.safeParse(Define, ['a', 'b']).success).toBeTrue();
  });
  it('unique-items-on-non-array', async () => {
    // uniqueItems 是数组专属关键字，被误写在 string 上时必须忽略，
    // 否则会把字符串逐字符去重，导致含重复字符的值误判
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema',
      type: 'array',
      items: { type: 'string', uniqueItems: true },
    } as any);
    expect(v.safeParse(Define, ['@schematics/angular', '@nx/angular']).success).toBeTrue();
    expect(v.safeParse(Define, ['aa/bb']).success).toBeTrue();
    expect(v.safeParse(Define, [1]).success).toBeFalse();
  });
  it('array-min-max-items', async () => {
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 3,
    } as any);
    expect(v.safeParse(Define, ['a']).success).toBeFalse();
    expect(v.safeParse(Define, ['a', 'b']).success).toBeTrue();
    expect(v.safeParse(Define, ['a', 'b', 'c']).success).toBeTrue();
    expect(v.safeParse(Define, ['a', 'b', 'c', 'd']).success).toBeFalse();
  });
  it('array-keywords-on-non-array', async () => {
    // minItems/maxItems 是数组关键字，误写在 string 上不得当成字符串长度约束
    const Define = jsonSchemaToValibot({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
      minItems: 10,
      maxItems: 12,
    } as any);
    expect(v.safeParse(Define, 'ab').success).toBeTrue();
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
  it('draft-07-single-items', async () => {
    const jsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: {
        type: 'string',
        uniqueItems: true,
      },
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const instance = assertType(Define, 'array');
    expect(instance.item.type).toEqual('string');
    expect(v.safeParse(Define, ['a']).success).toBeTrue();
    expect(v.safeParse(Define, [1]).success).toBeFalse();
  });
  it('draft-07-tuple-items', async () => {
    const jsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: [{ type: 'number' }, { type: 'boolean' }],
      additionalItems: { type: 'string' },
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    assertType(Define, 'tuple_with_rest');
    const result = v.safeParse(Define, [1, true, '1']);
    expect(result.output).toEqual([1, true, '1']);
  });
  it('contains-false', async () => {
    const jsonSchema = {
      type: 'array',
      items: true,
      contains: false,
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const instance = assertType(Define, 'array');
    const result = v.safeParse(Define, [1]);
    expect(result.success).toBeFalse();
  });
});
