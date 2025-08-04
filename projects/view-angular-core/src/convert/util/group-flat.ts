import { BaseSchemaHandle } from '@piying/valibot-visit';

export function groupFlat<T extends BaseSchemaHandle<any>>(list: T[]): T[] {
  return list.flatMap((item) => {
    if (item.children) {
      return [item, ...groupFlat(item.children)];
    } else {
      return item;
    }
  });
}
