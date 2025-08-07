import * as v from 'valibot';

import {
  rawConfig,
  setComponent,
  setInputs,
  setWrappers,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { assertFieldArray, assertFieldControl } from './util/is-field';
import { _PiResolvedCommonViewFieldConfig } from '@piying/view-angular-core';
import { getField } from './util/action';
import { DCONFIG_EFAULT_MERGE_STRAGEGY } from '../src/builder-base/const';

// 用于测试fields和model变动时,数值是否正确
describe('fieldGlobalConfig', () => {
  it('config replace', async () => {
    const obj = v.pipe(v.string(), setInputs({ k1: 1 }), setComponent('test1'));
    let result = createBuilder(obj, {
      types: {
        test1: { type: 'test1', inputs: { k2: 2 } },
      },
    });
    expect(result.inputs()).toEqual({ k1: 1, k2: 2 });
    result = createBuilder(obj, {
      defaultConfigMergeStrategy: {
        ...DCONFIG_EFAULT_MERGE_STRAGEGY,
        inputs: 'replace',
      },
      types: {
        test1: { type: 'test1', inputs: { k2: 2 } },
      },
    });
    expect(result.inputs()).toEqual({ k1: 1 });
  });
  it('mock componentInstance', async () => {
    let wrapperType = Symbol();
    const obj = v.pipe(
      v.string(),
      setInputs({ k1: 1 }),
      setWrappers([{ type: wrapperType }]),
    );
    let result = createBuilder(obj, {});

    expect(result.wrappers()[0].type).toBe(wrapperType);
  });
});
