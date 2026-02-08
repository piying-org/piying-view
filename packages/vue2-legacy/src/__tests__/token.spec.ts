import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { NFCSchema, setComponent, actions } from '@piying/view-core';
import Token from './component/token.vue';

describe('token', () => {
  it('初始化注入', async () => {
    let check = false;
    const schema = v.pipe(
      NFCSchema,
      setComponent(Token),
      actions.outputs.patch({
        tokenChange: (event: any) => {
          expect(event.options.value).ok;
          expect(event.schema.value).ok;
          expect(event.model).ok;
          check = true;
        },
      }),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {});

    expect(check).ok;
  });
});
