import * as v from 'valibot';

import { createBuilder } from './util/create-builder';

import { removeAttributes } from '../convert';

describe('attribute', () => {
  it('remove', async () => {
    const obj = v.pipe(v.string(), removeAttributes(['k1']));
    const resolved = createBuilder(obj);
    const inputs = resolved.attributes();
    expect(Object.keys(inputs).length).toEqual(0);
  });
});
