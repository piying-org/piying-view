import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { assertFieldControl } from './util/is-field';
describe('validator', () => {
  it('直接异常', async () => {
    const obj = v.object({
      k1: v.pipe(
        v.string(),
        formConfig({
          validators: [
            (control) => {
              expect(control).toBeTruthy();
              return { pwd: '1' };
            },
          ],
        }),
      ),
    });
    const resolved = createBuilder(obj);
    const child = resolved.get(['k1']);
    assertFieldControl(child!.form.control);
    child!.form.control.viewValueChange('');
    expect(child?.form.control?.errors).toBeTruthy();
  });
});
