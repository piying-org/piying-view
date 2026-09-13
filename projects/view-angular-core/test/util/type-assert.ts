/** 类型工具: 判断是否为 any */
export type IsAny<T> = 0 extends 1 & T ? true : false;
/** 类型工具: 判断是否为 unknown */
export type IsUnknown<T> = unknown extends T
  ? IsAny<T> extends true
    ? false
    : true
  : false;
/** 类型工具: 判断两个类型是否完全相等 */
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
/** 类型工具: 取 control 的 value 类型 */
export type Val<C> = NonNullable<C> extends { value: infer V } ? V : never;
