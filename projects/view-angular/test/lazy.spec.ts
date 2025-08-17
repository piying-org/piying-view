import { signal } from '@angular/core';
import * as v from 'valibot';
import { lazyMark } from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent } from '@piying/view-angular-core';

describe('lazy', () => {
  it('lazy-fn', async () => {
    const define = v.pipe(v.string(), setComponent('test1'));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('value1'),
      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-test1')).toBeTruthy();
  });
  it('lazy-mark', async () => {
    const define = v.pipe(v.string(), setComponent('test1'));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('value1'),
      {
        types: {
          test1: {
            type: lazyMark(() =>
              import('./test1/test1.component').then((a) => a.Test1Component),
            ) as any,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-test1')).toBeTruthy();
  });
});
