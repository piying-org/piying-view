import { signal } from '@angular/core';
import * as v from 'valibot';
import { actions, NFCSchema } from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent } from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';
import { Models1Component } from './models1/component';

describe('models', () => {
  it('input/output', async () => {
    const a = signal(0);
    const define = v.pipe(
      NFCSchema,
      setComponent(Models1Component),
      actions.models.patch({
        input1: a,
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = element.querySelector<HTMLElement>('.btn1')!;
    el.click();
    expect(a()).toEqual(1)
  });
  it('model', async () => {
    const a = signal(0);
    const define = v.pipe(
      NFCSchema,
      setComponent(Models1Component),
      actions.models.patch({
        input2: a,
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = element.querySelector<HTMLElement>('.btn2')!;
    el.click();
    expect(a()).toEqual(1)
  });
});
