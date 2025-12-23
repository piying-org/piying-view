import * as v from 'valibot';

import { actions, setComponent } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { BehaviorSubject } from 'rxjs';

// 用于测试fields和model变动时,数值是否正确
describe('input/output action', () => {
  it('async input', async () => {
    const wait$ = Promise.withResolvers<void>();
    const obj = v.pipe(
      v.string(),
      actions.inputs.patchAsync({
        value1: async () => {
          wait$.resolve();
          return 1;
        },
      }),
      setComponent('mock-input'),
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
      actions.inputs.patch({ value1: 2 }),
      actions.inputs.patchAsync({
        value1: async () => {
          wait$.resolve();
          return 1;
        },
      }),
      setComponent('mock-input'),
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
      actions.inputs.patchAsync({
        value1: () => {
          const subject = new BehaviorSubject(1);
          return subject;
        },
      }),
      setComponent('mock-input'),
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
      actions.inputs.patchAsync({
        value1: () => 1,
      }),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    let inputs = resolved.inputs();
    expect('value1' in inputs).toBeTrue();
    inputs = resolved.inputs();
    expect(inputs['value1']).toBe(1);
  });
  it('remove input', async () => {
    const obj = v.pipe(
      v.string(),
      actions.inputs.remove(['k1']),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    const inputs = resolved.inputs();
    expect(Object.keys(inputs).length).toBe(0);
  });
  it('remove output', async () => {
    const obj = v.pipe(
      v.string(),
      actions.outputs.remove(['k1']),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    const outputs = resolved.outputs();
    expect(Object.keys(outputs).length).toBe(0);
  });
});
