import * as V from 'valibot';
export { V };

import * as PVA from '@piying/view-angular';
export { PVA };

import * as PYVAC from '@piying/view-angular-core';
export { PYVAC };

import * as rxjs from 'rxjs';
export { rxjs };

import * as directive from '../angular/directive/code-index';
export { directive };

/** 与 code-eval.ts 注入到用户代码中的变量保持一致 */
declare global {
  export const v: typeof V;
  export const NFCSchema: (typeof PYVAC)['NFCSchema'];
  export const setComponent: (typeof PYVAC)['setComponent'];
  export const disableWhen: (typeof PYVAC)['disableWhen'];
  export const hideWhen: (typeof PYVAC)['hideWhen'];
  export const rawConfig: (typeof PYVAC)['rawConfig'];
  export const outputChange: (typeof PYVAC)['outputChange'];
  export const actions: (typeof PVA)['actions'];
  export const valueChange: (typeof PYVAC)['valueChange'];
  export const setAlias: (typeof PYVAC)['setAlias'];
  export const layout: (typeof PYVAC)['layout'];
  export const asVirtualGroup: (typeof PYVAC)['asVirtualGroup'];
  export const nonFieldControl: (typeof PYVAC)['nonFieldControl'];
  export const asControl: (typeof PYVAC)['asControl'];
  export const condition: (typeof PYVAC)['condition'];
  export const renderConfig: (typeof PYVAC)['renderConfig'];
  export const formConfig: (typeof PYVAC)['formConfig'];
  export const map: (typeof rxjs)['map'];
  export const skip: (typeof rxjs)['skip'];
  export const tap: (typeof rxjs)['tap'];
  export const of: (typeof rxjs)['of'];
  export const pipe: (typeof rxjs)['pipe'];
  export const debounceTime: (typeof rxjs)['debounceTime'];
  export const BehaviorSubject: (typeof rxjs)['BehaviorSubject'];
  export const FocusDirective: (typeof directive)['FocusDirective'];
}
export {};
