import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import oneofSchema from '../../fixture/jsonschema/oneof.json';

import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import { assertFieldLogicGroup } from '@piying/view-angular-core/test';
describe('oneof', () => {
  it('default', async () => {
    const define = jsonSchemaToValibot(oneofSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(15),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);

    expect(field?.form.control?.valid).toBeTrue();
    // expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(21);
    await fixture.whenStable();
    fixture.detectChanges();    
    expect(field?.form.control?.valid).toBeFalse();
  });
});
