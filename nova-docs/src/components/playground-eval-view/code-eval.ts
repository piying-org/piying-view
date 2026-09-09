import * as directive from '../../directive/code-index';
export async function codeEval(code: string) {
  const { map, skip, tap, BehaviorSubject, of, pipe, debounceTime } =
    await import('rxjs');
  const pyva = await import('@piying/view-angular');
  const pyvac = await import('@piying/view-angular-core');
  const v = await import('valibot');
  let result;
  try {
    result = new Function(
      'pyvac',
      'pyva',
      'directive',
      'map',
      'skip',
      'tap',
      'BehaviorSubject',
      'of',
      'pipe',
      'debounceTime',
      'v',
      `let {FocusDirective}=directive;
      let {NFCSchema,setComponent,disableWhen,hideWhen,rawConfig,outputChange,valueChange,setAlias,layout,asVirtualGroup,formConfig,asControl,nonFieldControl,condition,renderConfig}=pyvac;
      let {actions}=pyva;
      return ${code}`,
    )(
      pyvac,
      pyva,
      directive,
      map,
      skip,
      tap,
      BehaviorSubject,
      of,
      pipe,
      debounceTime,
      v,
    );
    if (result && typeof result === 'object' && 'schema' in result) {
      return result;
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
