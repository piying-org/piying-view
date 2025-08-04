import { PiResolvedCommonViewFieldConfig } from '../type';

export function* groupGenerator(
  list: PiResolvedCommonViewFieldConfig<any, any>[],
): Generator<PiResolvedCommonViewFieldConfig<any, any>, void, unknown> {
  for (const item of list) {
    if (!item.keyPath?.length && item.fieldGroup?.().length) {
      yield* groupGenerator(item.fieldGroup());
    } else if (item.keyPath?.length) {
      yield item;
    }
  }
}
