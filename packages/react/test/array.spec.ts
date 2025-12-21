import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';

import type { PiResolvedViewFieldConfig } from '@piying/view-react';
import { getField } from '@piying/view-core/test';
import { delay } from './util/delay';
describe('array', () => {
  it('set/remove', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(v.array(v.string()), getField(field$));
    const { instance } = await createComponent(schema, [], {
    });
    const field = await field$.promise;
    field.action.set('1', 0);
    await delay(10);
    let list = instance.container.querySelectorAll('input');
    expect(list.length).eq(1);
    field.action.set('2', 1);
    await delay(10);
    list = instance.container.querySelectorAll('input');
    expect(list.length).eq(2);
    field.action.remove(0);
    await delay(10);
    list = instance.container.querySelectorAll('input');
    expect(list.length).eq(1);
  });
});
