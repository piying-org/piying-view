import { signal } from '@angular/core';
import { Wrapper1Component } from './wrapper1/component';
import * as v from 'valibot';
import { componentClass, topClass } from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent, setWrappers } from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';

describe('attributes', () => {
  it('classonly-default', async () => {
    const define = v.object({
      key1: v.pipe(v.string(), setComponent('test1'), componentClass('abcd')),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.abcd')).toBeTruthy();
  });
  it('class-default', async () => {
    const define = v.object({
      key1: v.pipe(v.string(), setComponent('test1'), topClass('abcd')),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.abcd')).toBeTruthy();
  });
  it('class-replace', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        topClass('abcd'),
        topClass('abcd2'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.abcd')).toBeFalsy();
    expect(element.querySelector('.abcd2')).toBeTruthy();
  });
  it('class-merge', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        topClass('abcd'),
        topClass('abcd2', true),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.abcd')).toBeTruthy();
    expect(element.querySelector('.abcd2')).toBeTruthy();
  });
  it('wrapper-default', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        topClass('abcd'),
        // topClass('abcd2', true),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-wrapper1.abcd')).toBeTruthy();
  });
  it('wrapper-replace', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        topClass('abcd'),
        topClass('abcd2'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('app-wrapper1.abcd')).toBeFalsy();
    expect(element.querySelector('app-wrapper1.abcd2')).toBeTruthy();
  });
  it('wrapper-merge', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        topClass('abcd'),
        topClass('abcd2', true),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('app-wrapper1.abcd')).toBeTruthy();
    expect(element.querySelector('app-wrapper1.abcd2')).toBeTruthy();
  });

  it('class-wrapper定义自带', async () => {
    const define = v.object({
      key1: v.pipe(v.string(), setComponent('test1'), topClass('abcd')),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
            wrappers: ['wrapper1'],
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-wrapper1')).toBeTruthy();
    expect(element.querySelector('app-wrapper1.abcd')).toBeTruthy();
  });
});
