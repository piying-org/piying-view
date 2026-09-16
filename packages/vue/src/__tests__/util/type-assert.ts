export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

export type IsAny<T> = 0 extends 1 & T ? true : false;

/** 断言 actual 的类型恰好等于 Expected */
export declare function assertEq<A>(actual: A, ok: Equal<A, string | undefined>): void;

/** 断言 actual 的类型恰好是 number */
export declare function assertNum<A>(actual: A, ok: Equal<A, number>): void;

/** 断言 actual 不是 any */
export declare function assertNotAny<A>(
  actual: A,
  ok: IsAny<A> extends false ? false : never,
): void;
