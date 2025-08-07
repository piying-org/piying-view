import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import {
  _PiResolvedCommonViewFieldConfig,
  fieldControlStatusClass,
  controlStatusList,
  INVALID,
  VALID,
  formConfig,
  PENDING,
} from '@piying/view-angular-core';
import { assertFieldControl } from './util/is-field';
import { assertIssues } from './util/assert';

describe('status', () => {
  it('子级状态影响父级', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const k1Schema = v.object({
      k1: v.pipe(
        v.string(),
        v.check((value) => value === '1'),
        getField(field$),
      ),
    });
    const resolved = createBuilder(k1Schema);
    const field = await field$.promise;
    resolved.form.control?.updateValue({ k1: '1' });
    let statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('valid')).toBeTruthy();
    expect(field.form.control!.status$$()).toBe(VALID);
    expect(resolved.form.control!.status$$()).toBe(VALID);
    resolved.form.control?.updateValue({ k1: '2' });
    statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('invalid')).toBeTruthy();
    expect(field.form.control!.status$$()).toBe(INVALID);
    expect(resolved.form.control!.status$$()).toBe(INVALID);
  });
  it('子级状态影响父级-数组', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const k1Schema = v.object({
      a1: v.array(
        v.object({
          k1: v.pipe(v.string(), getField(field$)),
          k2: v.pipe(v.string()),
        }),
      ),
    });
    const resolved = createBuilder(k1Schema);
    resolved.form.control?.updateValue({ a1: [{ k1: '1' }] });
    const field = await field$.promise;
    const statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('invalid')).toBeTruthy();
    expect(resolved.form.control!.status$$()).toBe(INVALID);
    expect(field.form.control!.status$$()).toBe(VALID);
  });
  it('setViewValue验证失败后报异常', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const k1Schema = v.pipe(
      v.string(),
      v.check((value) => value === '1'),
      getField(field$),
    );
    const resolved = createBuilder(k1Schema);
    assertFieldControl(resolved.form.control);
    resolved.form.control.viewValueChange('2');
    const statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('invalid')).toBeTruthy();
    const valibotIssue = resolved.form.control.syncError$()?.['valibot'];
    expect(valibotIssue).toBeTruthy();
    assertIssues(valibotIssue);
    expect(valibotIssue?.[0].input).toBe('2');
  });
  it('pristine', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const k1Schema = v.object({
      k1: v.pipe(
        v.string(),

        getField(field$),
      ),
      k2: v.string(),
    });
    const resolved = createBuilder(k1Schema);
    let statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('pristine')).toBeTruthy();
    expect(resolved.form.control?.pristine).toBe(true);
    const field = await field$.promise;
    assertFieldControl(field.form.control);
    field.form.control?.viewValueChange('1');
    expect(field.form.control?.dirty).toBe(true);
    statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('dirty')).toBeTruthy();
    expect(resolved.form.control?.pristine).toBe(false);
  });
  it('校验异常清空', async () => {
    const k1Schema = v.pipe(
      v.number(),
      v.check((value) => value < 10),
    );
    const resolved = createBuilder(k1Schema);
    assertFieldControl(resolved.form.control);
    resolved.form.control.viewValueChange(5);
    let statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('valid')).toBeTruthy();
    expect(resolved.form.control.errors).toBeFalsy();
    resolved.form.control.viewValueChange(50);
    statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('invalid')).toBeTruthy();
    expect(resolved.form.control.errors).toBeTruthy();
    resolved.form.control.viewValueChange(6);
    statusList = controlStatusList(resolved.form.control);
    expect(statusList.includes('valid')).toBeTruthy();
    expect(resolved.form.control.errors).toBeFalsy();
    // 因为linkedSignal的计算属性相同,所以认为没变,但是实际上变了
  });
  it('status-class', async () => {
    const k1Schema = v.pipe(v.optional(v.number()));
    const resolved = createBuilder(k1Schema);
    assertFieldControl(resolved.form.control);
    const classStr = fieldControlStatusClass(resolved.form.control);
    expect(classStr.includes('pi-valid')).toBeTruthy();
    expect(classStr.includes('pi-pristine')).toBeTruthy();
    expect(classStr.includes('pi-untouched')).toBeTruthy();
  });
  it('子级pending影响父级', async () => {
    const obj = v.object({
      k1: v.pipe(
        v.string(),
        formConfig({
          asyncValidators: [
            async (control) => {
              await new Promise((resolve) => setTimeout(resolve, 999999));
              return undefined;
            },
          ],
        }),
      ),
      k2: v.string(),
    });
    const resolved = createBuilder(obj);
    resolved.form.control?.updateValue({ k1: '1', k2: '2' });
    const status = resolved.form.control?.status$$();
    expect(status).toEqual(PENDING);
  });

  it('touch all', async () => {
    const k1Schema = v.pipe(v.object({ k1: v.string() }));
    const resolved = createBuilder(k1Schema);
    expect(resolved.form.control?.untouched).toEqual(true);
    resolved.form.control?.markAllAsTouched();
    expect(resolved.form.control?.touched).toEqual(true);
    expect(resolved.fieldGroup!()[0].form.control?.touched).toEqual(true);
    resolved.form.control?.markAllAsUntouched();
    expect(resolved.form.control?.touched).toEqual(false);
    expect(resolved.fieldGroup!()[0].form.control?.touched).toEqual(false);
  });
  it('dirty all', async () => {
    const k1Schema = v.pipe(v.object({ k1: v.string() }));
    const resolved = createBuilder(k1Schema);
    expect(resolved.form.control?.pristine).toEqual(true);
    resolved.form.control?.markAllAsDirty();
    expect(resolved.form.control?.pristine).toEqual(false);
    expect(resolved.fieldGroup!()[0].form.control?.pristine).toEqual(false);
    resolved.form.control?.markAllAsPristine();
    expect(resolved.form.control?.pristine).toEqual(true);
    expect(resolved.fieldGroup!()[0].form.control?.pristine).toEqual(true);
  });
  it('disable', async () => {
    const k1Schema = v.string();
    const resolved = createBuilder(k1Schema);
    resolved.form.control?.disable();
    expect(resolved.form.control?.status$$()).toEqual(VALID);
  });
});
