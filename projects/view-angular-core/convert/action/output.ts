import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  ViewOutputs,
} from '../../builder-base';
import { combineLatest, map, Observable, skip, startWith, Subject } from 'rxjs';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
import { mergeHooksFn } from './hook';
import { KeyPath } from '../../util';
import { actions } from './input-common';
function createOutputListener<T>(
  outputs: ViewOutputs,
  options: { setOutputs: boolean; mergeOutput: boolean },
) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          field.outputs.update((originOutputs) => {
            originOutputs = options.setOutputs ? {} : { ...originOutputs };
            for (const key in outputs) {
              const oldFn = (originOutputs as any)[key];
              (originOutputs as any)[key] = (...args: any[]) => {
                if (options.mergeOutput && oldFn) {
                  oldFn(...args, field);
                }
                return (outputs as any)[key](...args, field);
              };
            }
            return originOutputs;
          });
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}
/** @deprecated use actions.outputs.set */
export const setOutputs = actions.outputs.set;
/** @deprecated use actions.outputs.patch */
export const patchOutputs = actions.outputs.patch;
/** @deprecated use actions.outputs.patchAsync */
export const patchAsyncOutputs = actions.outputs.patchAsync;
/** @deprecated use actions.outputs.remove */
export const removeOutputs = actions.outputs.remove;

export function mergeOutputFn(
  field: _PiResolvedCommonViewFieldConfig,
  outputs: ViewOutputs,
) {
  field.outputs.update((originOutputs) => {
    originOutputs = { ...originOutputs };
    for (const key in outputs) {
      const oldFn = (originOutputs as any)[key];
      (originOutputs as any)[key] = (...args: any[]) => {
        oldFn?.(...args, field);
        (outputs as any)[key](...args, field);
      };
    }
    return originOutputs;
  });
}

export const mergeOutputs = <T>(
  outputs: Record<string, (...args: any[]) => void>,
) =>
  createOutputListener<T>(outputs, {
    setOutputs: false,
    mergeOutput: true,
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
            mergeOutputFn(field, {
              [item.output]: (...args: any[]) => {
                subject.next(args);
              },
            });
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
