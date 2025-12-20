import * as v from 'valibot';

import { condition, Schema } from '@piying/valibot-visit';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreSchemaHandle,
  FormBuilder,
  patchInputs,
  setComponent,
} from '@piying/view-angular-core';
import { rawConfig } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { assertFieldControl } from './util/is-field';
import { Injectable, signal } from '@angular/core';

describe('自定义handle', () => {
  it('默认条件', () => {
    class HiddenType extends CoreSchemaHandle<any, any> {
      override defineSchema(schema: Schema): void {}
    }

    const obj = v.object({
      key1: v.pipe(v.string()),
    });
    const list = createBuilder(obj, { handle: HiddenType as any })
      .fixedChildren!();
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
    }).fixedChildren!();
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
    }).fixedChildren!();
    expect(list.length).toBe(1);
    assertFieldControl(list[0].form.control);

    // expect(list[0].type).toBe('abc');
  });

  it('input-sync', () => {
    @Injectable()
    class TestBuilder extends FormBuilder<any> {
      override afterResolveConfig(
        rawConfig: any,
        config: _PiResolvedCommonViewFieldConfig,
      ): _PiResolvedCommonViewFieldConfig | undefined {
        config.define!.update((data) => ({
          ...data,
          inputs: signal({ input1: '2' }),
        }));
        return config;
      }
    }

    const obj = v.pipe(
      v.string(),
      patchInputs({
        input1: '1',
      }),
      setComponent('mock-input'),
    );
    const field = createBuilder(obj, { builder: TestBuilder });

    expect(field.inputs()).toEqual({ input1: '2' });
    expect(field.define!().inputs!()).toEqual({ input1: '2' });
  });
});
