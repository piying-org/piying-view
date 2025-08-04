import * as v from 'valibot';

import { patchAsyncInputs, patchInputs } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { BehaviorSubject } from 'rxjs';

// 用于测试fields和model变动时,数值是否正确
describe('input/output action', () => {
  it('async input', async () => {
    const wait$ = Promise.withResolvers<void>();
    const obj = v.pipe(
      v.string(),
      patchAsyncInputs({
        value1: async () => {
          wait$.resolve();
          return 1;
        },
      }),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.inputs();
    expect('value1' in inputs).toBeTrue();
    expect((inputs as any).value1).toBeFalsy();
    await wait$.promise;
    inputs = resolved.inputs();
    expect(inputs['value1']).toBe(1);
  });
  it('async input-init', async () => {
    const wait$ = Promise.withResolvers<void>();
    const obj = v.pipe(
      v.string(),
      patchInputs({ value1: 2 }),
      patchAsyncInputs({
        value1: async () => {
          wait$.resolve();
          return 1;
        },
      }),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.inputs();
    expect((inputs as any).value1).toBe(2);
    await wait$.promise;
    inputs = resolved.inputs();
    expect(inputs['value1']).toBe(1);
  });
  it('subscribe input', async () => {
    const obj = v.pipe(
      v.string(),
      patchAsyncInputs({
        value1: () => {
          const subject = new BehaviorSubject(1);
          return subject;
        },
      }),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.inputs();
    expect('value1' in inputs).toBeTrue();
    inputs = resolved.inputs();
    expect(inputs['value1']).toBe(1);
  });
  it('sync input', async () => {
    const obj = v.pipe(
      v.string(),
      patchAsyncInputs({
        value1: () => 1,
      }),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.inputs();
    expect('value1' in inputs).toBeTrue();
    inputs = resolved.inputs();
    expect(inputs['value1']).toBe(1);
  });
});
