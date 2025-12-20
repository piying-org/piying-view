import { rawConfig } from './raw-config';
import { CoreRawProps } from '../../builder-base';
import { patchAsyncInputsCommonFn, removeInputsCommonFn } from './input-common';
export function setProps<T>(props: CoreRawProps) {
  return rawConfig<T>((field) => {
    field.props = props;
  });
}
export function patchProps<T>(props: CoreRawProps) {
  return rawConfig<T>((field) => {
    field.props = {
      ...field.props,
      ...props,
    };
  });
}
export const removeProps = removeInputsCommonFn('props');
export const patchAsyncProps = patchAsyncInputsCommonFn('props');
