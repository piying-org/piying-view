import { rawConfig } from './raw-config';
import { CoreRawViewAttributes } from '../../builder-base';

import {
  actions,
  patchAsyncAttributesCommon,
  patchAsyncEventsCommon,
  removeInputsCommonFn,
} from './input-common';
export const setAttributes = actions.set.attributes;
export const patchAttributes = actions.patch.attributes;
export const removeAttributes = actions.remove.attributes;
export const patchAsyncAttributes = actions.patchAsync.attributes;

export const patchAsyncEvents = actions.patchAsync.events;
