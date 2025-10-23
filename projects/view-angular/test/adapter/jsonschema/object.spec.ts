import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import {
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from '@piying/view-angular-core/test';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import { isUndefined, omitBy } from 'es-toolkit';
describe('object', () => {
  it('relate-req', async () => {
    const jsonSchema = {
      dependentRequired: { key1: ['req1'] },
      properties: {
        key1: {
          type: 'number',
        },
        req1: {
          type: 'number',
        },
      },
      additionalProperties: false,
    } as JsonSchemaDraft202012Object;
    const define = jsonSchemaToValibot(jsonSchema) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({}),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();

    field?.form.control?.updateValue({ fileterKey: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({});

    field?.form.control?.updateValue({ key1: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    field?.form.control?.updateValue({ key1: 1, req1: 22 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(field?.form.control?.value).toEqual({ key1: 1, req1: 22 });

    const control = field.form.control.get('req1');
    assertFieldControl(control);
    expect(control.config$().required).toBeTrue();
  });
  it('dependentSchemas', async () => {
    const jsonSchema = {
      dependentSchemas: {
        key1: {
          properties: {
            req1: {
              type: 'number',
            },
          },
          required: ['req1'],
        },
      },
      properties: {
        key1: {
          type: 'number',
        },
      },
    } as JsonSchemaDraft202012Object;
    const define = jsonSchemaToValibot(jsonSchema) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({}),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();

    field?.form.control?.updateValue({ fileterKey: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      fileterKey: 1,
    });

    field?.form.control?.updateValue({ key1: 1 });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field?.form.control?.valid).toBeFalse();
    field?.form.control?.updateValue({ key1: 1, req1: 22 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(field?.form.control?.value).toEqual({ key1: 1, req1: 22 });

    const control = field.get([1, 0, 'req1'])?.form.control;

    assertFieldControl(control);
    expect(control.config$().required).toBeTrue();
  });
});
