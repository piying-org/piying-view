import * as directive from '../../directive/code-index';

export interface CodeEvalResult {
  schema?: any;
  model?: any;
  context?: any;
  builderType?: string;
  error?: string;
}

export async function codeEval(code: string): Promise<CodeEvalResult> {
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
    return {
      error: '代码需要返回 { schema, model?, context?, builderType? } 对象',
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
