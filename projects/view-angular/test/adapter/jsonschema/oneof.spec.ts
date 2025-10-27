import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import oneofSchema from '../../fixture/jsonschema/oneof.json';
import oneofConditionSchema from '../../fixture/jsonschema/oneof-condition1.json';
import oneofConditionMultiSelectSchema from '../../fixture/jsonschema/oneof-condition-multiselect.json';
import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import {
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from '@piying/view-angular-core/test';
import { PiyingViewGroup } from '../../../lib/component/group/component';
import { SelectComponent } from '../component/select/component';
import { JsonSchemaDraft07 } from '@hyperjump/json-schema/draft-07';
import { BooleanComponent } from '../component/boolean/component';
import { TextComponent } from '../component/text/component';
import { JsonSchemaDraft202012 } from '@hyperjump/json-schema/draft-2020-12';
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
          multiselect: { type: SelectComponent },
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

  it('oneOf+dep', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        person: {
          type: 'object',
          properties: {
            'Do you have any pets?': {
              type: 'string',
              enum: ['No', 'Yes: One', 'Yes: More than one'],
              default: 'No',
            },
          },
          required: ['Do you have any pets?'],
          dependencies: {
            'Do you have any pets?': {
              oneOf: [
                {
                  properties: {
                    'Do you have any pets?': {
                      enum: ['No'],
                    },
                  },
                },
                {
                  properties: {
                    'Do you have any pets?': {
                      enum: ['Yes: One'],
                    },
                    'How old is your pet?': {
                      type: 'number',
                    },
                  },
                  required: ['How old is your pet?'],
                },
                {
                  properties: {
                    'Do you have any pets?': {
                      enum: ['Yes: More than one'],
                    },
                    'Do you want to get rid of any?': {
                      type: 'boolean',
                    },
                  },
                  required: ['Do you want to get rid of any?'],
                },
              ],
            },
          },
        },
      },
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal({}),
      // signal({ person: { 'Do you have any pets?': 'No' } }),
      {
        types: {
          number: { type: NumberComponent },
          string: { type: TextComponent },
          boolean: { type: BooleanComponent },

          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldGroup(field.form.control);
    expect(element.querySelectorAll('app-select').length).toEqual(1);
    field.form.control.updateValue({
      person: { 'Do you have any pets?': 'Yes: One' },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelectorAll('app-select').length).toEqual(1);
    expect(element.querySelectorAll('input').length).toEqual(1);
  });
  it('const-items-uniq', async () => {
    const jsonSchema = {
      oneOf: [
        {
          items: {
            enum: [1, 2],
          },
          uniqueItems: true,
        },
        {
          items: {
            enum: [3, 4],
          },
          uniqueItems: true,
        },
      ],
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal([2, 1]),
      {
        types: {
          number: { type: NumberComponent },
          string: { type: TextComponent },
          boolean: { type: BooleanComponent },

          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
          multiselect: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldControl(field.form.control);
    expect(field.form.control!.valid).toBeTrue();
    field.form.control.updateValue([3, 2]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control!.valid).toBeFalse();
    field.form.control.updateValue([1, 2, 3, 4]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control!.valid).toBeFalse();
  });
  it('const-items', async () => {
    const jsonSchema = {
      oneOf: [
        {
          items: {
            enum: [1, 2],
          },
        },
        {
          items: {
            enum: [3, 4],
          },
        },
      ],
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal([2, 1]),
      {
        types: {
          number: { type: NumberComponent },
          string: { type: TextComponent },
          boolean: { type: BooleanComponent },
          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
          'multiselect-repeat': { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldControl(field.form.control);
    expect(field.form.control!.valid).toBeTrue();
    field.form.control.updateValue([3, 2]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control!.valid).toBeFalse();
    field.form.control.updateValue([1, 1]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control!.valid).toBeTrue();
  });
  it('default-select', async () => {
    const jsonSchema = {
      type: 'object',
      oneOf: [
        {
          title: 'Option 1',
          properties: {
            lorem: {
              title: 'lorem',
              type: 'string',
            },
          },
          required: ['lorem'],
        },
        {
          title: 'Option 2',
          properties: {
            ipsum: {
              title: 'ipsum',
              type: 'string',
            },
          },
          required: ['ipsum'],
        },
      ],
    } as JsonSchemaDraft07;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal({}),
      {
        types: {
          number: { type: NumberComponent },
          string: { type: TextComponent },
          boolean: { type: BooleanComponent },
          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
          'multiselect-repeat': { type: SelectComponent },
          'oneOf-select': { type: PiyingViewGroup },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    expect(field.form.control!.valid).toBeFalse();
    assertFieldLogicGroup(field.form.control);
    field.form.control!.updateValue({ lorem: '1' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control!.valid).toBeTrue();
    expect(field.form.control!.value).toEqual({ lorem: '1' });
    field.form.control!.updateValue({ lorem: '1', ipsum: '2' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control!.valid).toBeFalse();
  });
  it('default-hidden', async () => {
    const jsonSchema = {
      oneOf: [
        {
          properties: {
            cond1: { const: 1 },
            value1: { type: 'string' },
          },
          required: ['cond1'],
        },
        {
          properties: {
            cond1: { const: 2 },
            value2: { type: 'string' },
          },
          required: ['cond1'],
        },
      ],
    } as JsonSchemaDraft202012;
    const Define = jsonSchemaToValibot(jsonSchema as any);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal({}),
      {
        types: {
          number: { type: NumberComponent },
          string: { type: TextComponent },
          boolean: { type: BooleanComponent },
          'oneOf-condition': { type: PiyingViewGroup },
          picklist: { type: SelectComponent },
          'multiselect-repeat': { type: SelectComponent },
          'oneOf-select': { type: PiyingViewGroup },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    expect(element.querySelectorAll('app-text').length).toEqual(0);
  });
});
