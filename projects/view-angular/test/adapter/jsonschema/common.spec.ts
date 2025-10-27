import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';

import { createSchemaComponent } from '../../util/create-component';
import { signal } from '@angular/core';
import { NumberComponent } from '../component/number/component';
import { assertFieldControl } from '@piying/view-angular-core/test';
import { SelectComponent } from '../component/select/component';
xdescribe('common', () => {
  it('title', async () => {
    const define = jsonSchemaToValibot({
      type: 'array',
      title: 'title1',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['Option 1', 'Option 2', 'Option 3'],
      },
    }) as any;
    console.log(define);

    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ k1: 1, k2: 2, k3: 3 }),
      {
        types: {
          number: { type: NumberComponent },
          multiselect: { type: SelectComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = field$$()!;
    assertFieldControl(field.form.control);
    expect(field.props()['title']).toEqual('title1');
  });
});
