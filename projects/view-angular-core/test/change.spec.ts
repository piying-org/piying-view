import * as v from 'valibot';

import { createBuilder } from './util/create-builder';

import { firstValueFrom, skip } from 'rxjs';

describe('change', () => {
  it('值变更', async () => {
    const obj = v.string();
    const resolved = createBuilder(obj);
    let result = await firstValueFrom(resolved.form.control!.valueChanges);
    expect(result).toBe(undefined);
    resolved.form.control!.updateValue('111');
    result = await firstValueFrom(
      resolved.form.control!.valueChanges.pipe(skip(1)),
    );
    expect(result).toBe('111');
  });
});
