import { ConfigMergeStrategyObject } from './type';

export const EMPTY_ARRAY = [];
export const NG_CONFIG_DEFAULT_MERGE_STRAGEGY: ConfigMergeStrategyObject = {
  directives: 'merge',
  formConfig: 'merge',
  inputs: 'merge',
  outputs: 'merge',
  props: 'merge',
  renderConfig: 'merge',
  wrappers: 'replace',
  attributes: 'merge',
};
