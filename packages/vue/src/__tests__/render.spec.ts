import { describe, it } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { setComponent, renderConfig } from '@piying/view-core';

describe('render', () => {
  // eslint-disable-next-line vitest/expect-expect
  it('none', async () => {
    const schema = v.pipe(v.any(), setComponent(''), renderConfig({ hidden: true }));
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {});
  });
});
