import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawViewOutputs,
} from '../../builder-base';
import { combineLatest, map, Observable, skip, startWith, Subject } from 'rxjs';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
import { mergeHooksFn } from './hook';
import { KeyPath } from '../../util';
export function setOutputs<T>(outputs: CoreRawViewOutputs) {
  return rawConfig<T>((field) => {
    field.outputs = outputs;
  });
}
export function patchOutputs<T>(outputs: CoreRawViewOutputs) {
  return rawConfig<T>((field) => {
    const oldValue = field.outputs;
    field.outputs = {
      ...oldValue,
      ...outputs,
    };
  });
}
export function removeOutputs<T>(list: string[]) {
  return rawConfig<T>((field) => {
    const oldValue = field.outputs;
    if (!oldValue) {
      return;
    }
    list.forEach((item) => {
      delete oldValue[item];
    });
    field.outputs = oldValue;
  });
}

export function mergeOutputFn(
  field: _PiResolvedCommonViewFieldConfig,
  outputs: CoreRawViewOutputs,
  options: { position: 'top' | 'bottom' },
) {
  field.outputs.update((originOutputs) => {
    originOutputs = { ...originOutputs };
    for (const key in outputs) {
      const oldFn = (originOutputs as any)[key];
      (originOutputs as any)[key] = (...args: any[]) => {
        if (options.position === 'top') {
          (outputs as any)[key](...args, field);
        }
        oldFn?.(...args, field);
        if (options.position === 'bottom') {
          (outputs as any)[key](...args, field);
        }
      };
    }
    return originOutputs;
  });
}
const DefaultOptions = { position: 'bottom' as const };

export const mergeOutputs = <T>(
  outputs: Record<string, (...args: any[]) => void>,
  options: { position: 'top' | 'bottom' } = DefaultOptions,
) =>
  rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          mergeOutputFn(field, outputs, options);
        },
      },
      { position: 'bottom' },
      field,
    );
  });

export type EventChangeFn = (
  fn: (
    input: {
      list: KeyPath | undefined;
      output: string;
    }[],
  ) => Observable<{
    field: _PiResolvedCommonViewFieldConfig;
    list: any[];
    listenFields: _PiResolvedCommonViewFieldConfig[];
  }>,
) => void;

export function outputChangeFn(
  rawField: AnyCoreSchemaHandle,
  fn: EventChangeFn,
) {
  mergeHooksFn(
    {
      allFieldsResolved: (field) =>
        fn((list) => {
          const resultList: {
            subject: Subject<any>;
            field: _PiResolvedCommonViewFieldConfig;
          }[] = [];
          for (const item of list) {
            const emitField = !item.list ? field : field.get(item.list)!;
            const subject = new Subject();
            mergeOutputFn(
              field,
              {
                [item.output]: (...args: any[]) => {
                  subject.next(args);
                },
              },
              { position: 'bottom' },
            );
            resultList.push({
              subject,
              field: emitField,
            });
          }
          return combineLatest(
            resultList.map(({ subject }) => subject.pipe(startWith(undefined))),
          ).pipe(
            skip(1),
            map((list) => ({
              list,
              field,
              listenFields: resultList.map((item) => item.field),
            })),
          );
        }),
    },
    { position: 'bottom' },
    rawField,
  );
}

export function outputChange<T>(fn: EventChangeFn) {
  return rawConfig<T>((field) => outputChangeFn(field, fn));
}
