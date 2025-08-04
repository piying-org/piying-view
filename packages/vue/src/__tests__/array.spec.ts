import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import type { PiResolvedViewFieldConfig } from '../formly/type/group';
import { delay } from './util/delay';
import { getField } from '@piying/view-core/test';
describe('array', () => {
  it('set/remove', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(v.array(v.string()), getField(field$));

    const value = shallowRef([]);
    const { instance } = await createComponent(schema, value, {});

    const field = await field$.promise;
    // add1
    field.action.set('1', 0);
    await delay(0);
    let list = instance.findAll('input');
    expect(list.length).eq(1);
    // add2
    field.action.set('1', 1);
    await delay(0);
    list = instance.findAll('input');
    expect(list.length).eq(2);
    // remove
    field.action.remove(0);
    await delay(0);
    list = instance.findAll('input');
    expect(list.length).eq(1);
  });
});
