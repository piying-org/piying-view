import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import {
  patchAsyncProps,
  patchProps,
  setProps,
} from '../src/convert/action/prop';

// 用于测试fields和model变动时,数值是否正确
describe('prop', () => {
  it('set', async () => {
    const obj = v.pipe(
      v.string(),
      setProps({ value1: 1 }),
      setProps({ value2: 2 }),
    );
    const resolved = createBuilder(obj);
    const inputs = resolved.props();
    expect(inputs['value2']).toEqual(2);
    expect('value1' in inputs).toBeFalse();
  });
  it('patch', () => {
    const obj = v.pipe(
      v.string(),
      setProps({ value1: 1 }),
      patchProps({ value2: 2 }),
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
      patchAsyncProps({
        value1: async () => {
          wait$.resolve();
          return 1;
        },
      }),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.props();
    expect('value1' in inputs).toBeTrue();
    await wait$.promise;
    inputs = resolved.props();
    expect(inputs['value1']).toBe(1);
  });
});
