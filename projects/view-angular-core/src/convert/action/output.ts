import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawViewOutputs,
} from '../../builder-base';
import { combineLatest, map, Observable, skip, startWith, Subject } from 'rxjs';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
import { mergeHooksFn } from './hook';
import { KeyPath } from '../../util';
function createOutputListener<T>(
  outputs: CoreRawViewOutputs,
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
export function setOutputs<T>(outputs: CoreRawViewOutputs) {
  return createOutputListener<T>(outputs, {
    setOutputs: true,
    mergeOutput: false,
  });
}
export function patchOutputs<T>(outputs: CoreRawViewOutputs) {
  return createOutputListener<T>(outputs, {
    setOutputs: false,
    mergeOutput: false,
  });
}
export function removeOutputs<T>(list: string[]) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          field.outputs.update((originOutputs) => {
            originOutputs = { ...originOutputs };
            list.forEach((key) => {
              if (key in originOutputs) {
                delete originOutputs[key];
              }
            });            
            return originOutputs;
          });
        },
      },
      { position: 'bottom' },
      field,
    );
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

export const mergeOutputs = <T>(
  outputs: Record<string, (...args: any[]) => void>,
) => {
  return createOutputListener<T>(outputs, {
    setOutputs: false,
    mergeOutput: true,
  });
};

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
