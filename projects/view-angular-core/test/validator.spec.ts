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

  it('定义可选转换', () => {
    const o1 = v.pipe(
      v.object({
        s1: v.pipe(v.string()),
        s2: v.pipe(v.optional(v.string())),
      }),
      v.transform((item) => {
        expect(item).toBeTruthy();
        return { ...item, s2: item.s2 ?? item.s1 };
      }),
    );
    let define = v.object({ o1: v.optional(o1) });
    const resolved = createBuilder(define);
    resolved.form.root.updateValue({ o1: { s2: undefined } });
    resolved.get(['o1'])!.form.control!.reset();
    expect(resolved.form.control!.value).toBeFalsy();
    resolved.form.root.updateValue({ o1: { s1: '11' } });
    expect(resolved.form.control!.value).toEqual({
      o1: { s1: '11', s2: '11' },
    });
  });
});
