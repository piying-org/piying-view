import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { actions, NFCSchema } from '@piying/view-core';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../src/type/group';
import { delay } from './util/delay';
import { convertToField } from '../src/util/convert-wrapper';
import { render, fireEvent } from '@testing-library/react';
import InputCustomBind from './component/input-custom-bind';
import HybridGroup from './component/hybrid-group';
import { setInputValue } from './util/event';

describe('custom-bind', () => {
  it('直接绑定', async () => {
    let field = convertToField(() => v.string());
    const { container } = render(<InputCustomBind field={field} />);
    await delay();
    const inputEl = container.querySelector('input') as HTMLInputElement;
    expect(inputEl).toBeTruthy();

    fireEvent.change(inputEl, { target: { value: 'inputvalue1' } });
    await delay();
    expect(field.form.root.value).eq('inputvalue1');

    fireEvent.change(inputEl, { target: { value: 'inputvalue2' } });
    await delay();
    expect(field.form.root.value).eq('inputvalue2');
  });

  it('赋值', async () => {
    const field1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(
      v.object({
        k1: v.pipe(v.string(), getField(field1$)),
        k2: v.pipe(
          v.string(),
          actions.attributes.set({ className: 'mode2' }),
          getField(field2$),
        ),
      }),
    );
    const value = { k1: '', k2: '' };
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          object: {
            type: HybridGroup,
          },
        },
      },
    });
    const inputs = instance.container.querySelectorAll('input');
    expect(inputs.length).eq(2);
    const el1 = instance.container.querySelector<HTMLInputElement>('.mode1')!;
    fireEvent.change(el1, { target: { value: 'inputValue1' } });
    await delay();
    let field1 = await field1$.promise;
    expect(field1.form.control!.value).eq('inputValue1');
    const el2 = instance.container.querySelector<HTMLInputElement>('.mode2')!;
    setInputValue(el2, 'inputValue2');
    await delay();
    let field2 = await field2$.promise;
    expect(field2.form.control!.value).eq('inputValue2');

    expect(instance.container.querySelector('.mode1-wrapper')).toBeTruthy();
  });
});
