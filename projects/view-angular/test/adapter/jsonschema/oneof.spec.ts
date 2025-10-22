import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import oneofSchema from '../../fixture/jsonschema/oneof.json';
import oneofConditionSchema from '../../fixture/jsonschema/oneof-condition1.json';
import oneofConditionMultiSelectSchema from '../../fixture/jsonschema/oneof-condition-multiselect.json';
import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import {
  assertFieldControl,
  assertFieldLogicGroup,
} from '@piying/view-angular-core/test';
import { PiyingViewGroup } from '../../../lib/component/group/component';
import { SelectComponent } from '../component/select/component';
import { getDeepError } from '@piying/view-angular-core';
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
    assertFieldControl(field.form.control);

    expect(field?.form.control?.valid).toBeTrue();
    // expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(21);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
  });
  it('condition-const', async () => {
    const define = jsonSchemaToValibot(oneofConditionSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: 1, value1: 1 }),
      {
        types: {
          number: { type: NumberComponent },
          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);

    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(21);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
  });
  it('condition-multi', async () => {
    const define = jsonSchemaToValibot(
      oneofConditionMultiSelectSchema as any,
    ) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: [2], value1: 1, value2: 2 }),
      {
        types: {
          number: { type: NumberComponent },
          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);

    expect(field?.form.control?.valid).toBeFalse();
    field?.form.control?.updateValue({ cond1: [2], value2: 3 });
    await fixture.whenStable();
    fixture.detectChanges();    
    expect(field?.form.control?.valid).toBeTrue();
  });
});
