import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { removeHooks } from '../src/convert';

describe('hook', () => {
  it('remove', async () => {
    const obj = v.pipe(v.string(), removeHooks(['fieldResolved']));
    const resolved = createBuilder(obj);
    const inputs = resolved.hooks;
    expect(Object.keys(inputs ?? {}).length).toEqual(0);
  });
});
