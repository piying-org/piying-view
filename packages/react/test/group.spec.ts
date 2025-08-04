import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';

import { componentClass, setComponent } from '@piying/view-core';

import { GroupAttr } from './component/group-attributes';
describe('group', () => {
  it('attributes', async () => {
    const schema = v.pipe(
      v.object({
        k1: v.string(),
      }),
      setComponent('group1'),
      componentClass('test1')
    );
    const value = { k1: '' };
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          group1: {
            type: GroupAttr,
          },
        },
      },
    });
    const inputEl = instance.container.querySelector('.test1.group-attr');
    expect(inputEl).ok;
  });
});
