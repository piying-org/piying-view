import { signal } from '@angular/core';
import * as v from 'valibot';
import { createSchemaComponent } from './util/create-component';
import { setComponent } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular-core';
import { NFCSchema } from '@piying/view-core';
import { Nest1Service } from './nest/nest1.service';
import { Nest1Component } from './nest/component';

describe('nest piying view', () => {
  it('hello', async () => {
    let checked = false;
    const define = v.pipe(
      NFCSchema,
      setComponent(Nest1Component),
      actions.inputs.patch({
        schema: v.pipe(
          v.string(),
          setComponent('test1'),
          actions.hooks.merge({
            allFieldsResolved(field) {
              let service = field.injector.get(Nest1Service);
              expect(service).toBeTruthy();
              checked = true;
            },
          }),
        ),
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    let el = element.querySelector('app-nest1');
    expect(el).toBeTruthy();
    expect(checked).toBeTrue();
  });
});
