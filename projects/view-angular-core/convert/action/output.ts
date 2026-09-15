import { rawConfig } from './raw-config';
import {
  PiFieldGet,
  _PiResolvedCommonViewFieldConfig,
  ViewOutputs,
} from '../../builder-base';
import { combineLatest, map, Observable, skip, startWith, Subject } from 'rxjs';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
import { mergeHooksFn } from './hook';
import { resolveListenField, ToKeyPath } from '../../util';
import { ListenPathOf } from './value-change';

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
  rawConfig<T>((field) => {
    for (const key in outputs) {
      const oldFn = field.outputs[key];
      field.outputs[key] = (...args: any[]) => {
        if (oldFn) {
          oldFn(...args);
        }
        return (outputs as any)[key](...args);
      };
    }
  });
export const asyncMergeOutputs = <T>(
  outputs: Record<
    string,
    (field: _PiResolvedCommonViewFieldConfig) => (...args: any[]) => void
  >,
) =>
  rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          field.outputs.update((originOutputs) => {
            originOutputs = { ...originOutputs };
            for (const key in outputs) {
              const fn = outputs[key](field);
              const oldFn = (originOutputs as any)[key];
              (originOutputs as any)[key] = (...args: any[]) => {
                if (oldFn) {
                  oldFn(...args);
                }
                return fn(...args);
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

/** outputChange 的单条监听项: 路径(undefined 即自身) + 要监听的 output 名 */
export interface OutputChangeListenEntry<F = unknown> {
  list?: ListenPathOf<F>;
  output: string;
}

/** 未绑定具体监听项时的兜底形态(保持宽松) */
export type AnyOutputListenList = readonly OutputChangeListenEntry[];

/** 监听项 E -> 对应的字段类型(未给路径即自身) */
export type OutputListenFieldOf<F, E> = E extends { list?: infer P }
  ? [Exclude<P, undefined>] extends [never]
    ? F
    : PiFieldGet<F, ToKeyPath<Exclude<P, undefined>>>
  : F;

/** outputChange 回调流: list 为每项 output 触发时的参数数组, listenFields 与监听项逐位对齐 */
export interface OutputChangeStream<
  F,
  L extends AnyOutputListenList = AnyOutputListenList,
> {
  field: F;
  list: { [I in keyof L]: any[] };
  listenFields: { [I in keyof L]: OutputListenFieldOf<F, L[I]> };
}

/**
 * 监听函数: 传入监听项元组, 返回与该元组逐位对齐的强类型流。
 * `const L` 保证 `['..', 'k1']` 这类字面量不会被拓宽成 `string[]`。
 */
export interface OutputChangeListenFn<F> {
  <const L extends readonly OutputChangeListenEntry<F>[]>(
    list: [...L],
  ): Observable<OutputChangeStream<F, L>>;
}

export type EventChangeFn<F = _PiResolvedCommonViewFieldConfig> = (
  fn: OutputChangeListenFn<F>,
) => void;

/** 按当前 field 造出带强类型的监听函数, 供 outputChange 注入回调 */
function createOutputChangeListenFn(
  field: _PiResolvedCommonViewFieldConfig,
): OutputChangeListenFn<_PiResolvedCommonViewFieldConfig> {
  return <const L extends AnyOutputListenList>(list: [...L]) => {
    const resultList: {
      subject: Subject<any>;
      field: _PiResolvedCommonViewFieldConfig;
    }[] = [];
    for (const item of list as readonly OutputChangeListenEntry<any>[]) {
      const emitField = resolveListenField(field, item.list);
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
    ) as unknown as Observable<
      OutputChangeStream<_PiResolvedCommonViewFieldConfig, L>
    >;
  };
}

export function outputChangeFn(
  rawField: AnyCoreSchemaHandle,
  fn: EventChangeFn,
) {
  mergeHooksFn(
    {
      allFieldsResolved: (field) => fn(createOutputChangeListenFn(field)),
    },
    { position: 'bottom' },
    rawField,
  );
}

export function outputChange<T>(fn: EventChangeFn) {
  return rawConfig<T>((field) => outputChangeFn(field, fn));
}
