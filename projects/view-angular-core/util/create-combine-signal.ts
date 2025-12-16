import {
  CreateSignalOptions,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

import { computed } from '@angular/core';
export type CombineSignal<Input> = Signal<Input[]> & {
  add: (item: WritableSignal<Input>, index?: number) => void;
  remove: (item: WritableSignal<Input>) => void;
  items: () => WritableSignal<Input>[];
  clean: () => void;
  update: (
    fn: (list: WritableSignal<Input>[]) => WritableSignal<Input>[],
  ) => void;
};
export function combineSignal<Input>(
  initialValue: WritableSignal<Input>[] = [],
  options?: CreateSignalOptions<Input[]>,
) {
  let list$ = signal<WritableSignal<Input>[]>(initialValue);
  const input$$ = computed(() => {
    return list$().map((item) => item());
  }, options);
  let changed$ = input$$ as any as CombineSignal<Input>;
  changed$.add = (item, index) => {
    list$.update((list) => {
      if (typeof index === 'number') {
        list = list.slice();
        list.splice(index, 0, item);
        return list;
      }
      return [...list, item];
    });
    list$.set([item]);
  };
  changed$.remove = (item) => {
    list$.update((list) => {
      let index = list.indexOf(item);
      if (index === -1) {
        return list;
      }
      list = list.slice();
      list.splice(index, 1);
      return list;
    });
  };
  changed$.items = () => list$();
  changed$.clean = () => list$.set([]);
  changed$.update = (fn) => {
    let list = fn(list$());
    list$.set(list);
  };
  return changed$;
}
