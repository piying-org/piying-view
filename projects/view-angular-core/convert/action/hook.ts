import { RawConfigActionCommon } from '@piying/valibot-visit';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
import { rawConfig } from './raw-config';
type Hooks = AnyCoreSchemaHandle['hooks'];
export type HooksConfig<T> = <B>(hooks: T) => RawConfigActionCommon<B>;
/** @deprecated use actions.hook.set */
export const setHooks: HooksConfig<Hooks> = (hooks) =>
  rawConfig((field) => {
    field.hooks = hooks;
  });
/** @deprecated use actions.hook.patch */
export const patchHooks: HooksConfig<Hooks> = (hooks) =>
  rawConfig((field) => {
    field.hooks = { ...field.hooks, ...hooks };
  });
type HooksKey = keyof NonNullable<Hooks>;
const DefaultOptions = { position: 'bottom' as const };
export type MergeHooksConfig<T> = <B>(
  hooks: T,
  options?: { position: 'top' | 'bottom' },
) => RawConfigActionCommon<B>;
export function mergeHooksFn<T extends AnyCoreSchemaHandle>(
  hooks: T['hooks'],
  options: { position: 'top' | 'bottom' },
  field: T,
) {
  field.hooks ??= {};
  for (const key in hooks) {
    const oldFn = (field.hooks as any)[key];
    (field.hooks as any)[key] = (...args: any) => {
      if (options.position === 'top') {
        (hooks as any)[key](...args);
      }
      oldFn?.(...args);
      if (options.position === 'bottom') {
        (hooks as any)[key](...args);
      }
    };
  }
}
/** @deprecated use actions.hook.merge */
export const mergeHooks: MergeHooksConfig<Hooks> = (
  hooks: Hooks,
  options: { position: 'top' | 'bottom' } = DefaultOptions,
) => rawConfig((field) => mergeHooksFn(hooks, options, field));
/** @deprecated use actions.hook.remove */
export function removeHooks<T>(list: HooksKey[]) {
  return rawConfig<T>((field) => {
    const oldValue = field.hooks;
    if (!oldValue) {
      return;
    }
    list.forEach((item) => {
      delete oldValue[item];
    });
    field.hooks = oldValue;
  });
}
