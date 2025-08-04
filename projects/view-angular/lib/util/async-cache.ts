import {
  computed,
  Injector,
  reflectComponentType,
  resource,
  Type,
  untracked,
} from '@angular/core';
import { NgResolvedComponentDefine2 } from '../type/component';
import { NgResolvedComponentDefine1 } from '../type';
function isComponentType(input: any): input is Type<any> {
  return !!reflectComponentType(input as any);
}
export function createAsyncCache<One extends boolean, Result>(
  one: One,
  injector: Injector,
) {
  const loading = new Map<any, Promise<Result>>();
  const cached = new Map<any, Result>();
  return (
    list:
      | (One extends true
          ? NgResolvedComponentDefine2
          : NgResolvedComponentDefine2[])
      | undefined,
  ) =>
    untracked(() => {
      if (!list) {
        return { value: computed(() => undefined) };
      }
      let hasPromise = false;
      const result = (
        ((one as One) ? [list] : list) as any as NgResolvedComponentDefine1[]
      ).map((item) => {
        if (cached.has(item)) {
          return cached.get(item)!;
        } else if (loading.has(item)) {
          hasPromise = true;
          return loading.get(item)!;
        }
        const resolved = item;
        const type = resolved.type;
        if (typeof type === 'string' || isComponentType(type)) {
          const result = { ...resolved, type: { component: type } };
          cached.set(item, result as any);
          return result;
        } else if (typeof type === 'function') {
          hasPromise = true;
          const result$$ = type().then((value) => {
            const result = {
              ...resolved,
              type: isComponentType(value) ? { component: value } : value,
            } as any;
            cached.set(item, result);
            loading.delete(item);
            return result;
          });
          loading.set(item, result$$);
          return result$$;
        } else {
          return resolved;
        }
      });
      if (hasPromise) {
        return resource<Result, undefined>({
          loader: async () => (one ? result[0] : Promise.all(result)) as any,
          injector: injector,
        });
      } else {
        return {
          value: computed<Result>(() => (one ? result[0] : result) as any),
        };
      }
    });
}
