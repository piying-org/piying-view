import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import anyOf from '../../fixture/jsonschema/anyof.json';
import anyOf2 from '../../fixture/jsonschema/anyof2.json';
import anyOfCondition1 from '../../fixture/jsonschema/anyof-condition1.json';
import anyOfConditionEnum from '../../fixture/jsonschema/anyof-condition-enum.json';
import anyOfConditionStr from '../../fixture/jsonschema/anyof-condition-string.json';
import anyOfConditionMulti from '../../fixture/jsonschema/anyof-condition-multiselect.json';
import anyOfConditionMultiKey from '../../fixture/jsonschema/anyof-condition-multi-key.json';
import anyOfConditionBase from '../../fixture/jsonschema/anyof-condition-base.json';

import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import {
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from '@piying/view-angular-core/test';
import { PiyingViewGroup } from '@piying/view-angular';
import { SelectComponent } from '../component/select/component';
import { isUndefined, omitBy } from 'es-toolkit';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import { JsonSchemaDraft07 } from '@hyperjump/json-schema/draft-07';
import { TextComponent } from '../component/text/component';
import { BooleanComponent } from '../component/boolean/component';
describe('anyof', () => {
  it('default', async () => {
    const define = jsonSchemaToValibot(anyOf as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(31),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldControl(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(19);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
  });
  it('invalid', async () => {
    const define = jsonSchemaToValibot(anyOf2 as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(31),
      { types: { number: { type: NumberComponent } } },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldControl(field.form.control);
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue(19);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
  });
  it('condition-const', async () => {
    const define = jsonSchemaToValibot(anyOfCondition1 as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: 1, value1: 10 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 1,
      value1: 10,
    });
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue({ cond1: 2, value2: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 2,
      value2: 10,
    });
    field?.form.control?.updateValue({});
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({});
  });
  it('condition-enum', async () => {
    const define = jsonSchemaToValibot(anyOfConditionEnum as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: 1, value1: 10 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 1,
      value1: 10,
    });
    expect(element.querySelectorAll('app-number').length).toEqual(1);
    field?.form.control?.updateValue({ cond1: 2, value2: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 2,
      value2: 10,
    });
    field?.form.control?.updateValue({ cond1: 4, value2: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    field?.form.control?.updateValue({ cond1: 3, value1: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 3,
      value1: 10,
    });
  });
  it('condition-str', async () => {
    const define = jsonSchemaToValibot(anyOfConditionStr as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: 5, value1: 10 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 5,
      value1: 10,
    });
    expect(element.querySelectorAll('app-number').length).toEqual(2);

    field?.form.control?.updateValue({ cond1: 6, value1: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
    expect(element.querySelectorAll('app-number').length).toEqual(1);

    field?.form.control?.updateValue({ cond1: 10, value2: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 10,
      value2: 10,
    });
  });
  it('condition-multi', async () => {
    const define = jsonSchemaToValibot(anyOfConditionMulti as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: [1], value1: 10 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
          multiselect: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: [1],
      value1: 10,
    });
    expect(element.querySelectorAll('app-select').length).toEqual(1);

    field?.form.control?.updateValue({ cond1: [3], value1: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();

    field?.form.control?.updateValue({ cond1: [3], value2: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: [3],
      value2: 10,
    });
    field?.form.control?.updateValue({ cond1: [2, 3], value2: 10, value1: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: [2, 3],
      value2: 10,
      value1: 10,
    });
  });

  it('condition-multi-key', async () => {
    const define = jsonSchemaToValibot(anyOfConditionMultiKey as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: 1, cond2: 2, value1: 10 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 1,
      cond2: 2,
      value1: 10,
    });
    expect(element.querySelectorAll('app-select').length).toEqual(2);
    expect(element.querySelectorAll('app-number').length).toEqual(1);

    field?.form.control?.updateValue({ cond1: 3, cond2: 2, value1: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();

    field?.form.control?.updateValue({ cond1: 3, cond2: 4, value2: 10 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 3,
      cond2: 4,
      value2: 10,
    });
  });
  it('condition-base', async () => {
    const define = jsonSchemaToValibot(anyOfConditionBase as any) as any;
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ cond1: 1, cond2: 2, value1: 10 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 1,
      cond2: 2,
      value1: 10,
    });
    field?.form.control?.updateValue({
      cond1: 3,
      cond2: 2,
      value1: 10,
      common1: 11,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 3,
      cond2: 2,
      value1: 10,
      common1: 11,
    });
  });
  it('enum2', async () => {
    const jsonSchema = {
      properties: {
        cond1: {
          enum: [1, 2],
        },
      },
      anyOf: [
        {
          properties: {
            cond1: {
              enum: [1],
            },
          },
        },
        {
          properties: {
            cond1: {
              enum: [2],
            },
          },
        },
      ],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal({ cond1: 1 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeTrue();
    expect(omitBy(field?.form.control?.value, isUndefined)).toEqual({
      cond1: 1,
    });
    field?.form.control?.updateValue({
      cond1: 3,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field?.form.control?.valid).toBeFalse();
  });
  it('enum3', async () => {
    const jsonSchema = {
      properties: {
        cond1: {
          enum: [1, 2],
        },
      },
      anyOf: [
        {
          properties: {
            cond1: {
              enum: [1],
            },
            value1: {
              type: 'string',
            },
          },
          required: ['value1'],
        },
        {
          properties: {
            cond1: {
              enum: [2],
            },
          },
        },
      ],
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal({ cond1: 1 }),
      {
        types: {
          number: { type: NumberComponent },
          'anyOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldLogicGroup(field.form.control);
    expect(field?.form.control?.valid).toBeFalse();
    expect(field.form.control.errors!['valibot'][0].message).toContain('anyOf');
    expect(field.form.control.errors!['valibot'][0].message).toContain(
      'value1',
    );
  });
});
