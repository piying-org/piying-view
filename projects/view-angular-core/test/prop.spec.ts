import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { setComponent } from '../convert';
import { actions } from '@piying/view-angular-core';
import { signal } from '@angular/core';

// 用于测试fields和model变动时,数值是否正确
describe('prop', () => {
  it('set', async () => {
    const obj = v.pipe(
      v.string(),
      actions.props.set({ value1: 1 }),
      actions.props.set({ value2: 2 }),
    );
    const resolved = createBuilder(obj);
    const inputs = resolved.props();
    expect(inputs['value2']).toEqual(2);
    expect('value1' in inputs).toBeFalse();
  });
  it('patch', () => {
    const obj = v.pipe(
      v.string(),
      actions.props.set({ value1: 1 }),
      actions.props.patch({ value2: 2 }),
    );
    const resolved = createBuilder(obj);
    const inputs = resolved.props();
    expect(inputs['value1']).toEqual(1);
    expect(inputs['value2']).toEqual(2);
  });
  it('patch async', async () => {
    const wait$ = Promise.withResolvers<void>();

    const obj = v.pipe(
      v.string(),
      actions.props.patchAsync({
        value1: async () => {
          wait$.resolve();
          return 1;
        },
      }),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.props();
    expect('value1' in inputs).toBeTrue();
    await wait$.promise;
    inputs = resolved.props();
    expect(inputs['value1']).toBe(1);
  });
  it('remove', async () => {
    const obj = v.pipe(v.string(), actions.props.remove(['k1']));
    let resolved = createBuilder(obj);
    let inputs = resolved.props();
    expect(Object.keys(inputs).length).toEqual(0);
    const obj2 = v.pipe(
      v.string(),
      actions.props.set({ k1: '1' }),
      actions.props.remove(['k1']),
    );
    resolved = createBuilder(obj2);
    inputs = resolved.props();
    expect(Object.keys(inputs).length).toEqual(0);
  });

  it('mapAsync', async () => {
    const value1 = signal(1);
    const obj = v.pipe(
      v.object({
        k1: v.pipe(
          v.string(),
          actions.props.patchAsync({
            value1: () => value1,
          }),
        ),
        k2: v.pipe(
          v.string(),

          actions.props.mapAsync((field) => {
            const field2 = field.get(['#', 'k1']);
            return (value) => ({
              value2: field2?.props()['value1'] * 2,
            });
          }),
          setComponent('mock-input'),
        ),
      }),
    );
    const resolved = createBuilder(obj);
    const field2 = resolved.get(['#', 'k2'])!;
    expect(field2.props()).toEqual({ value2: 2 });
    value1.set(2);
    expect(field2.props()).toEqual({ value2: 4 });
  });
});
