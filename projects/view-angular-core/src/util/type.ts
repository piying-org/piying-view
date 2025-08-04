import { Signal, WritableSignal } from '@angular/core';

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
type Wrapper$$<T> = {
  [P in keyof T]: Signal<T[P]>;
};
export type SetWrapper$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Wrapper$<Pick<OBJ, K>>;
export type SetWrapper$$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> &
  Wrapper$$<Pick<OBJ, K>>;

export type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};
