import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
import { InputFCC } from './mat-form-field/input/component';
import { MatInput } from '@angular/material/input';
import { MatFormFieldWrapper } from './mat-form-field/form-field/component';
import { htmlInput } from './util/input';
import { patchAsyncWrapper2 } from '@piying/view-angular-core';
import { directives } from '../lib/schema/action';
describe('mat', () => {
  it('mat input', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(v.string(), getField(fields$));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('v1'),
      {
        wrappers: {
          'form-field': { type: MatFormFieldWrapper },
        },
        types: {
          string: {
            type: InputFCC,
            actions: [
              patchAsyncWrapper2('form-field'),
              directives.patchAsync(MatInput),
            ],
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('mat-form-field')).toBeTruthy();
    expect(element.querySelector('input')).toBeTruthy();
    htmlInput(element.querySelector('input')!, '123');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toBe('123');
  });
});
