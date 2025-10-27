import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';

import { PiyingViewGroup } from '../../../lib/component/group/component';
import { SelectComponent } from '../component/select/component';
import { BooleanComponent } from '../component/boolean/component';
import { TextComponent } from '../component/text/component';
import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
describe('define', () => {
  it('ref', async () => {
    const jsonSchema = {
      definitions: {
        address: {
          type: 'object',
          properties: {
            street_address: {
              type: 'string',
              title: 'Street address',
            },
            city: {
              type: 'string',
              title: 'City',
            },
            state: {
              type: 'string',
              title: 'State',
            },
          },
          required: ['street_address', 'city', 'state'],
        },
        node: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/definitions/node',
              },
            },
          },
        },
      },
      type: 'object',
      properties: {
        billing_address: {
          title: 'Billing address',
          $ref: '#/definitions/address',
        },
        shipping_address: {
          title: 'Shipping address',
          $ref: '#/definitions/address',
        },
        tree: {
          title: 'Recursive references',
          $ref: '#/definitions/node',
        },
      },
    } as JsonSchemaDraft202012Object;
    const Define = jsonSchemaToValibot(jsonSchema);
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(Define as any),
      signal({
        billing_address: {
          street_address: '21, Jump Street',
          city: 'Babel',
          state: 'Neverland',
        },
        shipping_address: {
          street_address: '221B, Baker Street',
          city: 'London',
          state: 'N/A',
        },
        tree: {
          name: 'root',
          children: [
            {
              name: 'leaf',
            },
          ],
        },
      }),
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
    expect(field.form.control!.valid).toBeTrue();
  });
});
