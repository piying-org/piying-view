import { rawConfig } from './raw-config';
import { CoreRawWrapperConfig } from '../../builder-base';
import { toArray } from '../../util';

export function setWrappers<T>(wrappers: CoreRawWrapperConfig[]) {
  return rawConfig<T>((field) => {
    field.wrappers = wrappers;
  });
}
type PatchWrappersOptions = {
  position: 'head' | 'tail';
};
const defaultValue: PatchWrappersOptions = {
  position: 'tail',
};
export function patchWrappers<T>(
  wrappers: CoreRawWrapperConfig | CoreRawWrapperConfig[],
  options: PatchWrappersOptions = defaultValue,
) {
  return rawConfig<T>((field) => {
    const list = toArray(wrappers)!;
    field.wrappers ??= [];
    if (options.position === 'tail') {
      field.wrappers.push(...list);
    } else {
      field.wrappers.unshift(...list);
    }
  });
}
export function removeWrappers<T>(list: string[]) {
  return rawConfig<T>((field) => {
    if (!field.wrappers) {
      return;
    }
    const wrappers = field.wrappers;
    for (let i = 0; i < list.length; i++) {
      const name = list[i];
      for (let j = 0; j < wrappers.length; j++) {
        const config = wrappers[j];
        const name2 = typeof config === 'string' ? config : config.type;
        if (name2 === name) {
          wrappers.splice(j, 1);
          break;
        }
      }
    }
    field.wrappers = wrappers;
  });
}
