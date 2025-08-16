import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
describe('上下文', () => {
  it('上下文存在', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({ v1: v.pipe(v.string(), getField(field$)) });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      undefined,
      { value: 1 },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.context).toBeTruthy();
    expect(field.context).toEqual({ value: 1 });
  });
});
