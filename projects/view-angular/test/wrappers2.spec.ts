import { Signal, signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { Wrapper1Component } from './wrapper1/component';
import { Wrapper2Component } from './wrapper2/component';
import * as v from 'valibot';
import { getField } from './util/action';
import { setComponent, topClass } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular-core';
import { keyEqual } from '@piying/view-angular-core/test';

// 用于测试fields和model变动时,数值是否正确
describe('wrapper测试', () => {
  it('输入', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.wrappers.set([
          { type: 'wrapper1', inputs: { wInput1: 'v2test' } },
        ]),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),

      {
        wrappers: {
          wrapper1: { type: Wrapper1Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.wrapper1-div-label')?.innerHTML).toBe(
      'v2test',
    );
  });
  it('wrapper变化', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.wrappers.set(['wrapper1', 'wrapper2']),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: '' }),

      {
        wrappers: {
          wrapper1: { type: Wrapper1Component },
          wrapper2: { type: Wrapper2Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-wrapper1 app-wrapper2 ')).toBeTruthy();
    const field = await field$.promise;
    field.wrappers.update((item) => {
      item = item.slice();
      return item.reverse();
    });

    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-wrapper2 app-wrapper1')).toBeTruthy();
  });
  it('wrapper注入', async () => {
    const field$ = Promise.withResolvers<Signal<PiResolvedViewFieldConfig>>();
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.wrappers.set(['wrapper1']),
        actions.outputs.set({
          output3: (value) => {
            field$.resolve(value);
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: '' }),

      {
        wrappers: {
          wrapper1: { type: Wrapper1Component },
          wrapper2: { type: Wrapper2Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await field$.promise)().keyPath, 'key1');
    expect((await field$.promise)().form).toBeTruthy();
  });
  it('ngclass处于顶级', async () => {
    const field$ = Promise.withResolvers<Signal<PiResolvedViewFieldConfig>>();
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.wrappers.set(['wrapper1']),
        actions.outputs.set({
          output3: (value) => {
            field$.resolve(value);
          },
        }),
        topClass('hello'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: '' }),

      {
        wrappers: {
          wrapper1: { type: Wrapper1Component },
          wrapper2: { type: Wrapper2Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-wrapper1.hello')).toBeTruthy();
  });
  it('存在wrapper时ngclass', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      actions.wrappers.set([{ type: 'wrapper1' }]),
      topClass('data1'),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('v1'),
      {
        wrappers: {
          wrapper1: { type: Wrapper1Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = element.querySelector('.data1');
    expect(el).toBeTruthy();
  });
});
