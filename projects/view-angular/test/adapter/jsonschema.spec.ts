import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import IfSchema from '../fixture/jsonschema/if.json';
import IfTrueSchema from '../fixture/jsonschema/if-true.json';
import IfThenSchema from '../fixture/jsonschema/if-then.json';
import IfFalseSchema from '../fixture/jsonschema/if-false.json';
import IfElseSchema from '../fixture/jsonschema/if-else.json';
import { createSchemaComponent } from '../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from './component/number/component';
import { getDeepError } from '@piying/view-angular-core';
import * as v from 'valibot';
import { assertFieldLogicGroup } from '@piying/view-angular-core/test';
import { delay } from '../util/delay';
describe('json-schema', () => {
  it('if', async () => {
    let define = jsonSchemaToValibot(IfSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(8),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(7);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(15);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(14);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
  });
  it('if-true', async () => {
    let define = jsonSchemaToValibot(IfTrueSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(15),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(14);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
  });
  it('if-then', async () => {
    let define = jsonSchemaToValibot(IfThenSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(15),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(14);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
  });
  it('if-false', async () => {
    let define = jsonSchemaToValibot(IfFalseSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(8),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let field = field$$()!;    
    assertFieldLogicGroup(field.form.control);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(7);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
  });
  it('if-else', async () => {
    let define = jsonSchemaToValibot(IfElseSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(8),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let field = field$$()!;    
    assertFieldLogicGroup(field.form.control);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(7);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
  });
});
