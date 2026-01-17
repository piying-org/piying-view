import {
  CreateSignalOptions,
  isSignal,
  Signal,
  signal,
  untracked,
} from '@angular/core';

import { computed } from '@angular/core';
import { Observable } from 'rxjs';
import { isPromise, isSubscribable } from '../convert/util/is-promise';
export type AsyncObjectSignal<Input> = Signal<Input> & {
  connect: (
    key: string,
    value: Signal<any> | Promise<any> | Observable<any> | any,
  ) => void;
  disconnect: (key: string) => void;
  set(value: Input): void;
  update(updateFn: (value: Input) => Input): void;
  map(fn: (input: Input) => any): void;
};
export function asyncObjectSignal<
  Input extends Record<string, any> | undefined,
>(initialValue: Input, options?: CreateSignalOptions<Input>) {
  const data$ = signal(initialValue);
  const mapFn$ = signal<((value: any) => any) | undefined>(undefined);
  const signalList$ = signal<[string, Signal<any>][]>([]);
  const value$$ = computed(() => {
    const signalList = signalList$();
    const data = data$();
    const mapFn = mapFn$();
    if (!signalList.length) {
      return mapFn ? mapFn(data) : data;
    }
    const data2 = { ...data };
    signalList.forEach(([key, value]) => {
      (data2![key] as Record<string, any>) = value();
    });
    return mapFn ? mapFn(data2) : data2;
  }, options);
  const disposeMap = new Map<string, () => void>();
  const changed$ = value$$ as any as AsyncObjectSignal<Input>;
  changed$.connect = (key, value) => {
    changed$.disconnect(key);
    let dispose: (() => void) | undefined;
    if (isPromise(value)) {
      // promise
      let isDestroy = false;
      value.then((value: any) => {
        if (isDestroy) {
          return;
        }
        data$.update((lastData) => ({ ...lastData, [key]: value }));
      });
      dispose = () => {
        isDestroy = true;
      };
    } else if (isSubscribable(value)) {
      // rxjs
      const ref = value.subscribe({
        next: (value) => {
          data$.update((lastData) => ({ ...lastData, [key]: value }));
        },
      });
      dispose = () => {
        ref.unsubscribe();
      };
    } else if (isSignal(value)) {
      signalList$.update((list) => {
        list = list.slice();
        list.push([key, value]);
        return list;
      });
      dispose = () => {
        signalList$.update((list) => {
          const index = list.findIndex((item) => value === item[1]);
          if (index !== -1) {
            list = list.slice();
            list.splice(index, 1);
          }
          return list;
        });
      };
    } else {
      // 普通类型
      data$.update((lastData) => ({ ...lastData, [key]: value }));
    }
    if (dispose) {
      disposeMap.set(key, dispose);
    }
  };
  changed$.disconnect = (key) => {
    untracked(() => {
      disposeMap.get(key)?.();
      disposeMap.delete(key);
    });
  };
  changed$.set = (key) => {
    data$.set(key);
  };
  changed$.update = (fn: any) => {
    const result = fn(changed$());
    data$.set(result);
  };
  changed$.map = (input) => {
    mapFn$.set(input);
  };
  return changed$;
}
