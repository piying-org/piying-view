import { Signal, WritableSignal } from '@angular/core';
import { UnWrapSignal } from './unwrap-signal';

export type KeyPath = (string | number)[];
export type RawKeyPath = string | number;

export type SetOptional<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Partial<Pick<OBJ, K>>;
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
