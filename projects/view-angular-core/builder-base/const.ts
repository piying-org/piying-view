import { DefaultConfigKey } from './type';
import { ConfigMergeStrategy } from './type/common-field-config';

export const DCONFIG_EFAULT_MERGE_STRAGEGY: Record<
  DefaultConfigKey,
  ConfigMergeStrategy
> = {
  props: 'merge',
  formConfig: 'merge',
  renderConfig: 'merge',
  inputs: 'merge',
  outputs: 'merge',
  wrappers: 'replace',
  attributes: 'merge',
};
