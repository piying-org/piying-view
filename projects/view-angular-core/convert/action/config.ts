import { FieldRenderConfig } from '../../builder-base';
import { FieldFormConfig } from '../../field/type';
import { rawConfig } from './raw-config';

export function renderConfig<T>(type: FieldRenderConfig) {
  return rawConfig<T>((field) => {
    field.renderConfig = type;
  });
}
export function formConfig<T>(config: FieldFormConfig<T>) {
  return rawConfig<T>((field) => {
    field.formConfig = { ...field.formConfig, ...config };
  });
}
