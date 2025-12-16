import {
  CreateSignalOptions,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

import { computed } from '@angular/core';
type CombineSignal<Input> = Signal<Input[]> & {
  add: (item: WritableSignal<Input>) => void;
  remove: (item: WritableSignal<Input>) => void;
  items: () => WritableSignal<Input>[];
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
  changed$.add = (item) => {
    list$.update((list) => {
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
  return changed$;
}
