import { jsonSchemaToValibot } from '../../../src/adapter/json-schema/formly-json-schema.service';
import { assertType } from './util/assert-type';

describe('json-schema', () => {
  it('hello', () => {
    let jsonSchema = {
      type: 'object',
      properties: {
        s1: { type: 'string' },
        n1: { type: 'number' },
        n2: { type: 'integer' },
        b1: { type: 'boolean' },
        a1: { type: 'array' },
        nu1: { type: 'null' },
        o1: { type: 'object' },
      },
    } as const;
    let result = jsonSchemaToValibot(jsonSchema);
    let instance = assertType(result, 'loose_object');
    expect(Object.keys(instance.entries).length).toEqual(7);
    assertType(instance.entries['s1'], 'string');
    assertType(instance.entries['n1'], 'number');
    assertType(instance.entries['n2'], 'number');
    assertType(instance.entries['b1'], 'boolean');
    assertType(instance.entries['a1'], 'array');
    assertType(instance.entries['nu1'], 'null');
    assertType(instance.entries['o1'], 'loose_object');
  });
});
