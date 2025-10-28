import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import IfSchema from '../../fixture/jsonschema/if.json';
import IfTrueSchema from '../../fixture/jsonschema/if-true.json';
import IfThenSchema from '../../fixture/jsonschema/if-then.json';
import IfFalseSchema from '../../fixture/jsonschema/if-false.json';
import IfElseSchema from '../../fixture/jsonschema/if-else.json';
import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import { assertFieldLogicGroup } from '@piying/view-angular-core/test';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import { TextComponent } from '../component/text/component';
import { BooleanComponent } from '../component/boolean/component';
describe('if', () => {
  it('default', async () => {
    const define = jsonSchemaToValibot(IfSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(8),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
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
    const define = jsonSchemaToValibot(IfTrueSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(15),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
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
    const define = jsonSchemaToValibot(IfThenSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(15),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
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
    const define = jsonSchemaToValibot(IfFalseSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(8),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
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
    const define = jsonSchemaToValibot(IfElseSchema as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(8),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
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
  it('if-object', async () => {
    let jsonschema = {
      properties: {
        k1: {
          type: 'number',
        },
      },
      required: ['k1'],
      if: {
        properties: {
          k1: {
            minimum: 5,
          },
        },
      },
      then: {
        properties: {
          k2: {
            type: 'string',
          },
        },
      },
      else: {
        properties: {
          k3: {
            type: 'boolean',
          },
        },
      },
    } as JsonSchemaDraft202012Object;
    const define = jsonSchemaToValibot(jsonschema) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({}),
      {
        types: {
          number: { type: NumberComponent },
          string: { type: TextComponent },
          boolean: { type: BooleanComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);

    expect(field?.form.control?.valid).toBeFalse();

    expect(element.querySelectorAll('app-boolean').length).toEqual(1);
    expect(element.querySelectorAll('app-text').length).toEqual(0);
    field?.form.control?.updateValue({ k1: 6 });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-boolean').length).toEqual(0);
    expect(element.querySelectorAll('app-text').length).toEqual(1);
    field?.form.control?.updateValue({ k1: 4 });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-boolean').length).toEqual(1);
    expect(element.querySelectorAll('app-text').length).toEqual(0);
  });
});
