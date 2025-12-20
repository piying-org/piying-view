import { rawConfig } from './raw-config';
import { CoreRawProps } from '../../builder-base';
import { patchAsyncInputsCommonFn } from './input-common';
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
export function removeProps<T>(list: string[]) {
  return rawConfig<T>((field) => {
    const oldValue = field.props;
    if (!oldValue) {
      return;
    }
    list.forEach((item) => {
      delete oldValue[item];
    });
    field.props = oldValue;
  });
}
export const patchAsyncProps = patchAsyncInputsCommonFn('props');
