import * as v from 'valibot';
import { InjectionToken } from '@angular/core';
import {
  actions,
  _PiResolvedCommonViewFieldConfig,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { getField } from './util/action';

describe('providers', () => {
  const P1 = new InjectionToken<string>('P1');
  const P2 = new InjectionToken<string>('P2');
  const p1 = { provide: P1, useValue: 'v1' };
  const p2 = { provide: P2, useValue: 'v2' };

  const build = (schema: v.BaseSchema<any, any, any>) => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    createBuilder(v.pipe(schema, getField(field$)));
    return field$.promise;
  };

  it('set 覆盖式设置 providers', async () => {
    const field = await build(v.pipe(v.string(), actions.providers.set([p1])));
    expect(field.origin.providers).toEqual([p1]);
    expect(field.injector.get(P1)).toBe('v1');
  });

  it('patch 在未设置时自动初始化', async () => {
    const field = await build(
      v.pipe(v.string(), actions.providers.patch([p2])),
    );
    expect(field.origin.providers).toEqual([[p2]]);
    expect(field.injector.get(P2)).toBe('v2');
  });

  it('patch 在已设置时追加', async () => {
    const field = await build(
      v.pipe(
        v.string(),
        actions.providers.set([p1]),
        actions.providers.patch([p2]),
      ),
    );
    expect(field.origin.providers).toEqual([p1, [p2]]);
    expect(field.injector.get(P1)).toBe('v1');
    expect(field.injector.get(P2)).toBe('v2');
  });

  it('change 基于已有 providers 计算新值', async () => {
    const field = await build(
      v.pipe(
        v.string(),
        actions.providers.set([p1]),
        actions.providers.change((list) => [...list, p2]),
      ),
    );
    expect(field.origin.providers).toEqual([p1, p2]);
    expect(field.injector.get(P1)).toBe('v1');
    expect(field.injector.get(P2)).toBe('v2');
  });

  it('change 在没有已有 providers 时使用空数组兜底', async () => {
    let received: unknown;
    const field = await build(
      v.pipe(
        v.string(),
        actions.providers.change((list) => {
          received = list;
          return [p1];
        }),
      ),
    );
    expect(received).toEqual([]);
    expect(field.origin.providers).toEqual([p1]);
    expect(field.injector.get(P1)).toBe('v1');
  });

  it('providers 只作用于当前 field 的 injector', async () => {
    await build(v.object({ a: v.string() }));
    const child = createBuilder(v.object({ a: v.string() })).get(['a'])!;
    expect(child.injector.get(P1, null)).toBeNull();
  });
});
