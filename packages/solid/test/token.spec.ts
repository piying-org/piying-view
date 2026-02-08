import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';

import { actions, NFCSchema, setComponent } from '@piying/view-core';

import { Token } from './component/token';

describe('token', () => {
  it('初始化注入', async () => {
    let check = false;
    const schema = v.pipe(
      NFCSchema,
      setComponent(Token),
      actions.inputs.patch({
        tokenChange: (event: any) => {
          expect(event.options).ok;
          expect(event.schema).ok;
          check = true;
        },
      }),
    );
    const value = undefined;
    const { instance } = await createComponent(schema, value, {});
    expect(check).ok;
  });
});
