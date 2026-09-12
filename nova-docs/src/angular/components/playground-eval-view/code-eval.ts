import * as directive from '../../directive/code-index';
import { appendLog } from '../../components/log/append-log';

export interface CodeEvalResult {
  schema?: any;
  model?: any;
  context?: any;
  options?: Record<string, any>;
  builderType?: string;
  error?: string;
}

/** 注入到用户代码作用域里的变量，键名即变量名 */
async function buildScope() {
  const [rxjs, pyva, pyvac, v] = await Promise.all([
    import('rxjs'),
    import('@piying/view-angular'),
    import('@piying/view-angular-core'),
    import('valibot'),
  ]);

  return {
    v,
    pyva,
    pyvac,
    directive,
    map: rxjs.map,
    skip: rxjs.skip,
    tap: rxjs.tap,
    of: rxjs.of,
    pipe: rxjs.pipe,
    filter: rxjs.filter,
    debounceTime: rxjs.debounceTime,
    BehaviorSubject: rxjs.BehaviorSubject,
    actions: pyva.actions,
    NFCSchema: pyvac.NFCSchema,
    setComponent: pyvac.setComponent,
    disableWhen: pyvac.disableWhen,
    hideWhen: pyvac.hideWhen,
    rawConfig: pyvac.rawConfig,
    outputChange: pyvac.outputChange,
    valueChange: pyvac.valueChange,
    setAlias: pyvac.setAlias,
    layout: pyvac.layout,
    asVirtualGroup: pyvac.asVirtualGroup,
    asControl: pyvac.asControl,
    nonFieldControl: pyvac.nonFieldControl,
    condition: pyvac.condition,
    renderConfig: pyvac.renderConfig,
    formConfig: pyvac.formConfig,
    appendLog,
  };
}

export async function codeEval(code: string): Promise<CodeEvalResult> {
  try {
    const scope = await buildScope();
    const fn = new Function(
      '__scope',
      // 括号防止 return 后紧跟注释时触发 ASI，变成 return;
      `const { ${Object.keys(scope).join(', ')} } = __scope;\nreturn (\n${code}\n);`,
    );
    const result = fn(scope);
    if (result && typeof result === 'object' && 'schema' in result) {
      return result;
    }
    return {
      error: '代码需要返回 { schema, model?, context?, options?, builderType? } 对象',
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
