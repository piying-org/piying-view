import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick } from 'vue';
import { modelValueEqual } from './util/model-value-equal';
import { delay } from './util/delay';
import { setComponent } from '@piying/view-core';
import { shallowRef } from './util/stub-ref';

describe('hello', () => {
  it('string', async () => {
    const schema = v.string();
    const value = shallowRef('init');
    const { instance } = await createComponent(schema, value);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, '123');
  });
  it('dynamic', async () => {
    const schema = v.pipe(v.string(), setComponent('dynamic'));
    const value = shallowRef('init');
    const { instance } = await createComponent(schema, value);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, '123');
  });
  it('group=>string', async () => {
    const schema = v.object({
      k1: v.string(),
    });
    const value = shallowRef({ k1: 'init' });
    const { instance } = await createComponent(schema, value);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, { k1: '123' });
  });
  it('group=>group=>string', async () => {
    const schema = v.object({
      o1: v.object({ k1: v.string() }),
    });
    const value = shallowRef({ o1: { k1: 'init' } });
    const { instance } = await createComponent(schema, value);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, { o1: { k1: '123' } });
  });
  it('arry=>string', async () => {
    const schema = v.array(v.string());
    const value = shallowRef(['init']);
    const { instance } = await createComponent(schema, value);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, ['123']);
  });
  it('boolean', async () => {
    const schema = v.boolean();
    const value = shallowRef(true);
    const { instance } = await createComponent(schema, value);
    const inputEl = instance.find('input');
    expect(inputEl.element.checked).eq(true);
    inputEl.trigger('click');
    inputEl.trigger('change');
    expect(inputEl.element.checked).eq(false);
    await nextTick();
    await delay();
    modelValueEqual(instance, false);
  });
  it('select', async () => {
    const schema = v.picklist(['v1', 'v2']);
    const value = shallowRef('v1');
    const { instance } = await createComponent(schema, value);
    const el = instance.find('select');
    expect(el.element.value).eq('v1');
    el.setValue('v2');
    expect(el.element.value).eq('v2');
    await nextTick();
    await delay();
    modelValueEqual(instance, 'v2');
  });
  it('radio', async () => {
    const schema = v.pipe(v.picklist(['v1', 'v2']), setComponent('radio'));
    const value = shallowRef('v1');
    const { instance } = await createComponent(schema, value);
    const r1El = instance.find('.r1');
    const r2El = instance.find('.r2');
    expect(r1El.element.checked).eq(true);
    r2El.trigger('click');
    r2El.trigger('change');
    expect(r2El.element.checked).eq(true);
    await nextTick();
    await delay();
    modelValueEqual(instance, 'v2');
  });
});
