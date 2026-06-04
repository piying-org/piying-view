import { HybridBindComponent } from './component';
import { signal } from '@angular/core';
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';
import { htmlInput } from '../util/input';
import { PiResolvedViewFieldConfig } from '../../lib/type';
import { getField } from '@piying/view-angular-core/test';
import { createSchemaComponent } from '../util/create-component';
describe('hybrid-bind', () => {
  it('默认', async () => {
    const field1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(
        v.pipe(
          v.object({
            k1: v.pipe(v.string(), getField(field1$)),
            k2: v.pipe(
              v.string(),
              setComponent('test1'),
              actions.class.top('mode2'),
            ),
          }),
          setComponent(HybridBindComponent),
        ),
      ),
      signal({ v1: [[{ key1: 'value1' }]] }),
    );
    fixture.detectChanges();
    const field1 = await field1$.promise;
    expect(instance).toBeTruthy();
    const mode1Input = fixture.nativeElement.querySelector('.mode1');
    expect(mode1Input).toBeTruthy();
    htmlInput(mode1Input, 'inputValue');
    const mode2Input = fixture.nativeElement.querySelector('.mode2 input');
    expect(mode2Input).toBeTruthy();
    htmlInput(mode2Input, 'inputValue2');
    fixture.detectChanges();
    const field = field$$();
    expect(field1.form.control!.value).toBe('inputValue');
    expect(field?.get(['k2'])!.form.control!.value).toBe('inputValue2');
    expect(mode2Input).toBeTruthy();
  });
});
