import { Signal, WritableSignal } from '@angular/core';
import { UnWrapSignal } from './unwrap-signal';

export type KeyPath = (string | number)[];
export type RawKeyPath = string | number;

/**
 * 只读路径: 与 KeyPath 同构, 但能被 `const` 类型参数原样推断成字面量元组。
 * 监听类 action(valueChange / hideWhen / disableWhen / outputChange)的 list 用它承接路径。
 */
export type ListenPath = readonly (string | number)[];

/** 只读路径 -> 可变 KeyPath, 供 `field.get` / `PiFieldGet` 使用 */
export type ToKeyPath<P> = P extends readonly (string | number)[]
  ? [...P]
  : never;

export type SetOptional<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Partial<Pick<OBJ, K>>;
export type SetRequired<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Required<Pick<OBJ, K>>;
export type SetReadonly<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Readonly<Pick<OBJ, K>>;
export type ArraryIterable<T> = T[] | Iterable<T>;

export type QueryPath = string | number | KeyPath;
export type Wrapper$<T> = {
  [P in keyof T]: WritableSignal<T[P]>;
};
export type UnWrapper$<T> = {
  [P in keyof T]: UnWrapSignal<T[P]>;
};
type Wrapper$$<T> = {
  [P in keyof T]: Signal<T[P]>;
};
export type SetWrapper$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Wrapper$<Pick<OBJ, K>>;
export type SetUnWrapper$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  UnWrapper$<Pick<OBJ, K>>;
export type SetWrapper$$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Wrapper$$<Pick<OBJ, K>>;

export type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};
