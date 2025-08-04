import { signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../index';
import { Test1Component } from './test1/test1.component';
import { firstValueFrom, skip } from 'rxjs';
import * as v from 'valibot';
import { getField } from './util/action';
import { createSchemaComponent } from './util/create-component';
import { setComponent } from '@piying/view-angular-core';

describe('status', () => {
  it('statusChange', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      setComponent(Test1Component),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('1'),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const field = await field$.promise;
    let status = firstValueFrom(
      field.form.control!.statusChanges.pipe(skip(1)),
    );
    instance.model$.set(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(await status).toBe('INVALID');
    status = firstValueFrom(field.form.control!.statusChanges.pipe(skip(1)));
    instance.model$.set('1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(await status).toBe('VALID');
  });
});
