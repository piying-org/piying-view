import * as v from 'valibot';

import { createBuilder } from './util/create-builder';

import { firstValueFrom, skip } from 'rxjs';
import { ValueEvent } from '../field/abstract_model';
import { FieldControl } from '../field/field-control';

describe('valueEvent', () => {
  it('control', async () => {
    const obj = v.string();
    const field = createBuilder(obj);
    let result = firstValueFrom(field.form.control!.valueEvent$$);
    field.form.control!.updateValue('1');
    expect(await result).toEqual(ValueEvent.model);
    result = firstValueFrom(field.form.control!.valueEvent$$);
    (field.form.control as FieldControl).viewValueChange('2');
    expect(await result).toEqual(ValueEvent.view);
    expect(field.form.control?.value).toEqual('2');
  });
  it('group', async () => {
    const obj = v.object({ k1: v.string() });
    const field = createBuilder(obj);
    let k1Field = field.get(['k1'])!;
    let result = firstValueFrom(field.form.control!.valueEvent$$);
    k1Field.form.control!.updateValue('1');
    expect(await result).toEqual(ValueEvent.model);
    result = firstValueFrom(field.form.control!.valueEvent$$);
    (k1Field.form.control as FieldControl).viewValueChange('2');
    expect(await result).toEqual(ValueEvent.view);
  });
  it('array', async () => {
    const obj = v.array(v.string());
    const field = createBuilder(obj);
    field.action.set('1');
    let k1Field = field.children!()![0];
    let result = firstValueFrom(field.form.control!.valueEvent$$);
    k1Field.form.control!.updateValue('1');
    expect(await result).toEqual(ValueEvent.model);
    result = firstValueFrom(field.form.control!.valueEvent$$);
    (k1Field.form.control as FieldControl).viewValueChange('2');
    expect(await result).toEqual(ValueEvent.view);
  });
  it('logic-group', async () => {
    const obj = v.intersect([v.object({ k1: v.string() })]);
    const field = createBuilder(obj);
    let k1Field = field.get([0, 'k1'])!;
    let result = firstValueFrom(field.form.control!.valueEvent$$);
    k1Field.form.control!.updateValue('1');
    expect(await result).toEqual(ValueEvent.model);
    result = firstValueFrom(field.form.control!.valueEvent$$);
    (k1Field.form.control as FieldControl).viewValueChange('2');
    expect(await result).toEqual(ValueEvent.view);
  });
});
