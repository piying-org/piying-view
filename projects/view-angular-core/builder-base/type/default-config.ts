import { BaseMetadata, BaseTransformation, BaseValidation } from 'valibot';
import { LazyImport } from '../../util';
import {
  ConfigMergeStrategy,
  CoreWrapperConfig1,
  PiCommonDefaultConfig,
} from './common-field-config';
export interface PiCommonConfig {
  types?: Record<string, PiCommonDefaultConfig>;
  /** @deprecated 使用defaultConfig中的actions代替 */
  defaultConfig?: Omit<PiCommonDefaultConfig, 'type'>;
  /** @deprecated 使用defaultConfig中的actions代替 */
  defaultConfigMergeStrategy?: Record<DefaultConfigKey, ConfigMergeStrategy>;
  wrappers?: Record<
    string,
    Omit<CoreWrapperConfig1, 'type'> & {
      type: any | LazyImport<any>;
      actions?: BaseMetadata<any>[];
    }
  >;
}

export type DefaultConfigKey = Exclude<
  keyof PiCommonDefaultConfig,
  'type' | 'actions'
>;
