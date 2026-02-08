import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick, shallowRef, type ComputedRef } from 'vue';
import InputsTest from './component/inputs-test.vue';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { NFCSchema, setComponent, actions } from '@piying/view-core';
import Wrapper1 from './component/wrapper1.vue';
import Wrapper2 from './component/wrapper2.vue';
import WrapperField from './component/wrapper-field.vue';
import { delay } from './util/delay';
import WrapperOutput from './component/wrapper-output.vue';
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
