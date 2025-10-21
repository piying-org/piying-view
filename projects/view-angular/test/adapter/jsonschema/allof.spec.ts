import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import allOfSchema from '../../fixture/jsonschema/allof.json';
import allOfObjSchema from '../../fixture/jsonschema/allof-obj.json';

import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import {
  assertFieldControl,
  assertFieldGroup,
} from '@piying/view-angular-core/test';
describe('allof', () => {
  it('default', async () => {
    const define = jsonSchemaToValibot(allOfSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(10),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldControl(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(9);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(field.form.control.errors!['valibot']![0].type).toEqual('min_value');
    field?.form.control?.updateValue(51);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(field.form.control.errors!['valibot']![0].type).toEqual('max_value');
  });
  it('allOfObjSchema', async () => {
    const define = jsonSchemaToValibot(allOfObjSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ k1: 1, k2: 2, k3: 3 }),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldGroup(field.form.control);
    expect(field?.form.control?.value).toEqual({ k1: 1, k2: 2, k3: 3 });
  });
});
