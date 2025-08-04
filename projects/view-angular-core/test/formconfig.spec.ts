import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { formConfig } from '@piying/view-angular-core';
import { assertFieldControl } from './util/is-field';
import { debounceTime, filter, map, pipe } from 'rxjs';
import { delay } from './util/delay';

// 用于测试fields和model变动时,数值是否正确
describe('formConfig', () => {
  it('pipe-toModel', () => {
    const obj = v.pipe(
      v.string(),
      formConfig({
        pipe: {
          toModel: pipe(map((item) => `${item}1`)),
        },
      }),
    );
    const result = createBuilder(obj);
    assertFieldControl(result.form.control);
    result.form.control.viewValueChange('2');
    expect(result.form.control.value).toEqual('21');
  });
  it('pipe-toModel-filter', () => {
    const obj = v.pipe(
      v.string(),
      formConfig({
        pipe: {
          toModel: pipe(filter((item) => item === '1')),
        },
      }),
    );
    const result = createBuilder(obj);
    assertFieldControl(result.form.control);
    result.form.control.viewValueChange('1');
    result.form.control.viewValueChange('2');
    expect(result.form.control.value).toEqual('1');
  });
  it('pipe-toModel-debounce', async () => {
    const obj = v.pipe(
      v.string(),
      formConfig({
        pipe: {
          toModel: pipe(debounceTime(1)),
        },
      }),
    );
    const result = createBuilder(obj);
    assertFieldControl(result.form.control);
    result.form.control.viewValueChange('1');
    expect(result.form.control.value).not.toEqual('1');
    await delay(2);
    expect(result.form.control.value).toEqual('1');
  });
});
