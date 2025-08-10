import { PiResolvedCommonViewFieldConfig } from '../type';

export function* groupGenerator(
  list: PiResolvedCommonViewFieldConfig<any, any>[],
): Generator<PiResolvedCommonViewFieldConfig<any, any>, void, unknown> {
  for (const item of list) {
    if (!item.keyPath?.length && item.fixedChildren?.().length) {
      yield* groupGenerator(item.fixedChildren());
    } else if (item.keyPath?.length) {
      yield item;
    }
  }
}
