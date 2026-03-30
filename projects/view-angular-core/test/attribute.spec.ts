import * as v from 'valibot';

import { createBuilder } from './util/create-builder';

import { actions, setComponent } from '../convert';

describe('attribute', () => {
  it('remove', async () => {
    const obj = v.pipe(
      v.string(),
      actions.attributes.remove(['k1']),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    const inputs = resolved.attributes();
    expect(Object.keys(inputs).length).toEqual(0);
  });
  it('attributes-top-set-wrapper', async () => {
    const obj = v.pipe(
      v.string(),
      setComponent('mock-input'),
      actions.wrappers.patch(['t1']),
      actions.attributes.top.set({ id: '1' }),
    );
    const resolved = createBuilder(obj, { wrappers: ['t1'] });
    expect(resolved.wrappers()[0].attributes()).toEqual({ id: '1' });
  });
  it('attributes-top-patch-wapper', async () => {
    const obj = v.pipe(
      v.string(),
      setComponent('mock-input'),
      actions.wrappers.patch(['t1']),
      actions.attributes.top.set({ id: '1' }),
      actions.attributes.top.patch({ value: '2' }),
    );
    const resolved = createBuilder(obj, { wrappers: ['t1'] });
    expect(resolved.wrappers()[0].attributes()).toEqual({
      id: '1',
      value: '2',
    });
  });
  it('attributes-top-set', async () => {
    const obj = v.pipe(
      v.string(),
      setComponent('mock-input'),
      actions.attributes.top.set({ id: '1' }),
    );
    const resolved = createBuilder(obj);
    expect(resolved.attributes()).toEqual({ id: '1' });
  });
  it('attributes-top-patch', async () => {
    const obj = v.pipe(
      v.string(),
      setComponent('mock-input'),
      actions.attributes.top.set({ id: '1' }),
      actions.attributes.top.patch({ value: '2' }),
    );
    const resolved = createBuilder(obj);
    expect(resolved.attributes()).toEqual({
      id: '1',
      value: '2',
    });
  });
});
