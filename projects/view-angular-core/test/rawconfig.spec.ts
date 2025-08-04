import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { keyEqual } from './util/key-equal';
import { rawConfig } from '@piying/view-angular-core';

// 用于测试fields和model变动时,数值是否正确
describe('rawConfig', () => {
  it('rawConfig', () => {
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        rawConfig((value) => {
          value.props ??= {};
          value.props['props1'] = 1;

          return value;
        }),
      ),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toBe(1);
    keyEqual(result[0].keyPath, 'key1');
    expect(result[0].props()['props1']).toBe(1);
  });
});
