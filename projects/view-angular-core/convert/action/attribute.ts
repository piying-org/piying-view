import { rawConfig } from './raw-config';
import { CoreRawViewAttributes } from '../../builder-base';

import {
  patchAsyncAttributesCommon,
  patchAsyncEventsCommon,
  removeInputsCommonFn,
} from './input-common';
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
export const removeAttributes = removeInputsCommonFn('attributes');
export const patchAsyncAttributes = patchAsyncAttributesCommon;

export const patchAsyncEvents = patchAsyncEventsCommon;
