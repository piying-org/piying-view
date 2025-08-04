import { Signal, signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { createSchemaComponent } from './util/create-component';
import * as v from 'valibot';
import { setOutputs } from '@piying/view-angular-core';
import { setComponent } from '@piying/view-angular-core';
import { keyEqual } from '@piying/view-angular-core/test';

describe('inject', () => {
  it('field注入', async () => {
    const field$ = Promise.withResolvers<Signal<PiResolvedViewFieldConfig>>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        setOutputs({
          output3: (value) => {
            field$.resolve(value);
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await field$.promise)().keyPath, 'v1');
    expect((await field$.promise)().form).toBeTruthy();
  });
});
