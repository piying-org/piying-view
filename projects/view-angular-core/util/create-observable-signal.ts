import {
  CreateSignalOptions,
  DestroyRef,
  inject,
  Injector,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  OperatorFunction,
  pipe,
  shareReplay,
  tap,
} from 'rxjs';
type ObservableSignal<Input, Output> = WritableSignal<Input> & {
  input: Signal<Input>;
  output: Signal<Output>;
  loading: Signal<boolean>;
  input$$: Observable<Input>;
  subject: BehaviorSubject<Input>;
  output$$: Observable<Output>;
};
const DefaultOptions = { autoDestroy: true };
/** set输入,()输出的是管道后的值, */
export function observableSignal<Input, Output>(
  initialValue: Input,
  options?: CreateSignalOptions<Input> & {
    pipe?: OperatorFunction<Input, Output>;
    injector?: Injector;
    autoDestroy?: boolean;
  },
) {
  options = { ...DefaultOptions, ...options };
  const inputS$ = signal(initialValue, options);
  const outputS$ = signal<any>(undefined);
  const loading$ = signal(false);
  const inputR$ = new BehaviorSubject<any>(undefined);
  inputR$.next(inputS$());
  const data: Observable<Output> = inputR$.pipe(
    tap(() => {
      loading$.set(true);
    }),
    options?.pipe ? options.pipe : (pipe() as any),
    shareReplay(),
  );
  const oldOutputSet = outputS$.set;

  data.subscribe((value) => {
    oldOutputSet(value);
    loading$.set(false);
  });
  const oldSet = inputS$.set;
  const changed$ = outputS$ as any as ObservableSignal<Input, Output>;
  changed$.set = (value: Input) => {
    inputR$.next(value);
    return oldSet(value);
  };
  changed$.update = (fn: (value: Input) => Input) => {
    const newValue = fn(inputS$());
    return changed$.set(newValue);
  };
  changed$.output = outputS$;
  changed$.input = inputS$;
  changed$.input$$ = inputR$.asObservable();
  changed$.output$$ = data;
  changed$.subject = inputR$;
  if (options?.injector || options.autoDestroy) {
    const injector = options?.injector ?? inject(Injector, { optional: true });
    if (injector) {
      injector.get(DestroyRef).onDestroy(() => {
        inputR$.complete();
      });
    }
  }

  return changed$;
}
