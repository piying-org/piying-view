import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-angular-core';

/**
 * 定位到根下的 __log 字段（LogNFCC），往它的 logs 输入追加一条日志。
 * 需要 definition 中包含：`__log: v.pipe(NFCSchema, setComponent('log'), actions.inputs.set({ logs: [] }))`
 */
export const appendLog = (
  field: _PiResolvedCommonViewFieldConfig,
  message: string,
) => {
  const logField = field.get(['#', '__log']);
  logField!.inputs.update((inputs) => {
    const logs = (inputs['logs'] as string[] | undefined) ?? [];
    return { ...inputs, logs: [...logs, `${logs.length + 1}. ${message}`] };
  });
};
