import * as v from 'valibot';

import { condition, Schema } from '@piying/valibot-visit';
import { CoreSchemaHandle } from '@piying/view-angular-core';
import { rawConfig } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { assertFieldControl } from './util/is-field';

describe('自定义handle', () => {
  it('默认条件', () => {
    class HiddenType extends CoreSchemaHandle<any, any> {
      override defineSchema(schema: Schema): void {}
    }

    const obj = v.object({
      key1: v.pipe(v.string()),
    });
    const list = createBuilder(obj, { handle: HiddenType as any })
      .fieldGroup!();
    expect(list.length).toBe(1);
    assertFieldControl(list[0].form.control);

    // expect(list[0].type).toBe(undefined);
  });
  it('默认条件不覆盖', () => {
    class HiddenType extends CoreSchemaHandle<any, any> {}

    const obj = v.object({
      key1: v.pipe(
        v.string(),
        condition({
          environments: ['default'],
          actions: [
            rawConfig((item) => {
              item.type = 'abc';
              return item;
            }),
          ],
        }),
      ),
    });
    const list = createBuilder(obj, {
      handle: HiddenType as any,
      types: ['abc'],
    }).fieldGroup!();
    expect(list.length).toBe(1);
    assertFieldControl(list[0].form.control);

    // expect(list[0].type).toBe('abc');
  });
  it('改变环境', () => {
    class HiddenType extends CoreSchemaHandle<any, any> {
      // override beforeSchemaType(schema: Schema): void {}
      override metadata(metadata: any, workOn: any) {
        if (metadata.type !== 'condition') {
          return;
        }
        super.metadata(metadata, workOn);
      }
    }

    const obj = v.object({
      key1: v.pipe(
        v.string(),
        condition({
          environments: ['t1'],
          actions: [
            rawConfig((item) => {
              item.type = 'abc';
              return item;
            }),
          ],
        }),
      ),
    });
    const list = createBuilder(obj, {
      handle: HiddenType as any,
      environments: ['t1'],
      types: ['abc'],
    }).fieldGroup!();
    expect(list.length).toBe(1);
    assertFieldControl(list[0].form.control);

    // expect(list[0].type).toBe('abc');
  });
});
