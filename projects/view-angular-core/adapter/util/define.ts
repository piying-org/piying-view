import * as v from 'valibot';
import * as jsonActions from '@piying/view-angular-core';
import { isUndefined } from 'es-toolkit';

const alwaysTrueDefine = v.pipe(
  v.any(),
  jsonActions.setComponent('always-true'),
);
const alwaysFalseDefine = v.pipe(
  v.any(),
  v.check((value) => isUndefined(value)),
);

export function getBooleanDefine(value: boolean) {
  return value ? alwaysTrueDefine : alwaysFalseDefine;
}
