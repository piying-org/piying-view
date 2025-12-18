import { rawConfig } from './raw-config';
import { CoreRawViewAttributes } from '../../builder-base';
import { unWrapSignal } from '../../util';

import { patchAsyncAttributesCommon, patchAsyncEventsCommon } from './input-common';
export function setAttributes<T>(attributes: CoreRawViewAttributes) {
  return rawConfig<T>((field) => {
    field.attributes = attributes;
  });
}
export function patchAttributes<T>(attributes: CoreRawViewAttributes) {
  return rawConfig<T>((field) => {
    field.attributes = {
      ...field.attributes,
      ...attributes,
    };
  });
}
export function removeAttributes<T>(list: string[]) {
  return rawConfig<T>((field) => {
    const oldValue = unWrapSignal(field.attributes);
    if (!oldValue) {
      return;
    }
    list.forEach((item) => {
      delete oldValue[item];
    });
    field.attributes = oldValue;
  });
}
export const patchAsyncAttributes =patchAsyncAttributesCommon

export const patchAsyncEvents = patchAsyncEventsCommon
