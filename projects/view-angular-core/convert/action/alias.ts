import { rawConfig } from './raw-config';
import { RawConfigAction } from '@piying/valibot-visit';

/** 给字段设置别名, 别名以字面量体现在类型中, 支持 get(['@alias']) 强类型查询 */
export function setAlias<Alias extends string, T = any>(alias: Alias) {
  return rawConfig<T>((field) => {
    field.alias = alias;
  }) as RawConfigAction<'viewRawConfig', T> & { readonly alias: Alias };
}
