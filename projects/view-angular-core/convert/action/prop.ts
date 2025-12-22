import { rawConfig } from './raw-config';
import { CoreRawProps } from '../../builder-base';
import {
  actions,
  patchAsyncInputsCommonFn,
  removeInputsCommonFn,
} from './input-common';

export const setProps = actions.set.props;
export const patchProps = actions.patch.props;
export const removeProps = actions.remove.props;
export const patchAsyncProps = patchAsyncInputsCommonFn('props');
