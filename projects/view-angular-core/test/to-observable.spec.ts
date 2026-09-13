import * as v from 'valibot';
import { ApplicationRef, computed, runInInjectionContext, signal } from '@angular/core';
import { toObservable } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';

describe('toObservable', () => {
  const setup = () => {
    const result = createBuilder(v.string());
    const appRef = result.injector.get(ApplicationRef);
    const trigger = signal(0);
    return { injector: result.injector, appRef, trigger };
  };

  it('显式传入 injector: 首值立即可得, listen 变化后持续推送', () => {
    const { injector, appRef, trigger } = setup();
    const label = signal('a');
    const source = computed(() => `${label()}-${trigger()}`);

    const values: string[] = [];
    toObservable(trigger, source, { injector }).subscribe((v) => values.push(v));
    expect(values).toEqual(['a-0']);

    label.set('b');
    trigger.set(1);
    appRef.tick();
    expect(values).toEqual(['a-0', 'b-1']);
  });

  it('未传 injector 时从注入上下文获取', () => {
    const { injector, appRef, trigger } = setup();
    const source = computed(() => trigger() * 2);

    const obs = runInInjectionContext(injector, () =>
      toObservable(trigger, source),
    );
    const values: number[] = [];
    obs.subscribe((n) => values.push(n));
    expect(values).toEqual([0]);

    trigger.set(3);
    appRef.tick();
    expect(values).toEqual([0, 6]);
  });

  it('listen 到首次执行仍未变化时, 跳过重复首值', () => {
    const { injector, appRef, trigger } = setup();
    const source = computed(() => trigger() * 2);

    const values: number[] = [];
    toObservable(trigger, source, { injector }).subscribe((n) => values.push(n));
    appRef.tick();
    expect(values).toEqual([0]);
  });

  it('首次执行前 listen 已变化时, 首跑即推送新值', () => {
    const { injector, appRef, trigger } = setup();
    const source = computed(() => trigger() * 2);

    const values: number[] = [];
    toObservable(trigger, source, { injector }).subscribe((n) => values.push(n));
    trigger.set(5);
    appRef.tick();
    expect(values).toEqual([0, 10]);
  });

  it('source 抛错时 observable 收到 error', () => {
    const { injector, appRef, trigger } = setup();
    const boom = new Error('boom');
    const source = computed(() => {
      if (trigger() === 1) {
        throw boom;
      }
      return 'ok';
    });

    const errors: unknown[] = [];
    toObservable(trigger, source, { injector }).subscribe({
      next: () => {},
      error: (err) => errors.push(err),
    });
    expect(errors).toEqual([]);

    trigger.set(1);
    appRef.tick();
    expect(errors).toEqual([boom]);
  });
});
