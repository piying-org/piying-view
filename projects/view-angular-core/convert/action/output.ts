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
        // 与 mergeOutputs / asyncMergeOutputs 保持一致: 原样透传 emit 参数。
        // 以前这里会往尾部追加 field, 但多包一层就多追加一颗(多个监听器合并时会累积),
        // 且 field 已经能从 patchAsync 回调 / listenFields 拿到, 故去掉。
        oldFn?.(...args);
        (outputs as any)[key](...args);
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

/**
 * outputChange 的单条监听项: 路径(undefined 即自身) + 要监听的 output 名。
 *
 * `OutputName` 默认 string(裸函数形态保持宽松),
 * 组件版门面把它换成「该组件 output() 的名字联合」即可精确约束。
 */
export interface OutputChangeListenEntry<
  F = unknown,
  OutputName extends string = string,
> {
  list?: ListenPathOf<F>;
  output: OutputName;
}

/** 未绑定具体监听项时的兜底形态(保持宽松) */
export type AnyOutputListenList<OutputName extends string = string> =
  readonly OutputChangeListenEntry<any, OutputName>[];

/**
 * 「output 名 -> 处理器签名」的映射。
 * 拿不到组件信息时退成宽松形态, list 元素仍是 any[]。
 */
export type AnyOutputsHandlerMap = Record<string, (...args: any[]) => any>;

/** 监听项 E -> 它监听的 output 名 */
type OutputNameOf<E> = E extends { output: infer N extends string } ? N : string;

/** output 名 -> 该 output 被 emit 时的参数元组 */
type EmitArgsOf<Outputs, Name> = Name extends keyof Outputs
  ? NonNullable<Outputs[Name]> extends (...args: infer A) => any
    ? A
    : any[]
  : any[];

/** 监听项 E -> 该 output 的 emit 参数元组 */
export type OutputEmitArgsOf<Outputs, E> = EmitArgsOf<Outputs, OutputNameOf<E>>;

/** 监听项 E -> 对应的字段类型(未给路径即自身) */
export type OutputListenFieldOf<F, E> = E extends { list?: infer P }
  ? [Exclude<P, undefined>] extends [never]
    ? F
    : PiFieldGet<F, ToKeyPath<Exclude<P, undefined>>>
  : F;

/**
 * outputChange 回调流: list 为每项 output 触发时的参数数组, listenFields 与监听项逐位对齐。
 *
 * `Outputs` 是「output 名 -> 处理器签名」映射:
 * 组件版门面把组件的 output() 传进来, list 每一位就是对应事件的 emit 参数元组。
 * 某项还没触发过时是 undefined(合成首帧已被 skip, 但同批其他项可能仍未 emit)。
 */
export interface OutputChangeStream<
  F,
  L extends AnyOutputListenList = AnyOutputListenList,
  Outputs extends AnyOutputsHandlerMap = AnyOutputsHandlerMap,
> {
  field: F;
  list: { [I in keyof L]: OutputEmitArgsOf<Outputs, L[I]> | undefined };
  listenFields: { [I in keyof L]: OutputListenFieldOf<F, L[I]> };
}

/**
 * 监听函数: 传入监听项元组, 返回与该元组逐位对齐的强类型流。
 * `const L` 保证 `['..', 'k1']` 这类字面量不会被拓宽成 `string[]`。
 */
export interface OutputChangeListenFn<
  F,
  OutputName extends string = string,
  Outputs extends AnyOutputsHandlerMap = AnyOutputsHandlerMap,
> {
  <const L extends readonly OutputChangeListenEntry<F, OutputName>[]>(
    list: [...L],
  ): Observable<OutputChangeStream<F, L, Outputs>>;
}

export type EventChangeFn<
  F = _PiResolvedCommonViewFieldConfig,
  OutputName extends string = string,
  Outputs extends AnyOutputsHandlerMap = AnyOutputsHandlerMap,
> = (fn: OutputChangeListenFn<F, OutputName, Outputs>) => void;

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
      mergeOutputFn(emitField, {
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
