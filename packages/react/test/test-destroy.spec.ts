import { describe, expect, it } from 'vitest';
import { createComponent } from './util/create-component';
import * as v from 'valibot';
import { delay } from './util/delay';
import type { PiResolvedViewFieldConfig } from '../src/type';
import { getField } from './util/actions';
describe('销毁测试', () => {
  it('组件销毁', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(v.string(), getField(field$));
    const model = 'init';
    const { instance, modelChange$ } = await createComponent(schema, model);
    const el = instance.container.querySelector('input')!;
    expect(el.value).eq('init');
    const field = await field$.promise;
    let isEnd = false;

    field.form.control?.valueChanges.subscribe({
      next: () => {
      },
      complete: () => {
        isEnd = true;
      },
    });
    instance.unmount();
    await delay(10);
    expect(isEnd).eq(true);
  });
});
