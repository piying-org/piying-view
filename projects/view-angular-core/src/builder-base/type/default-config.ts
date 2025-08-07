import { LazyImport } from '../../util';
import {
  ConfigMergeStrategy,
  CoreWrapperConfig1,
  PiCommonDefaultConfig,
} from './common-field-config';
export interface PiCommonConfig {
  types?: Record<string, PiCommonDefaultConfig>;

  defaultConfig?: PiCommonDefaultConfig;
  defaultConfigMergeStrategy?: Record<DefaultConfigKey, ConfigMergeStrategy>;
  wrappers?: Record<
    string,
    Omit<CoreWrapperConfig1, 'type'> & {
      type: any | LazyImport<any>;
    }
  >;
}

export type DefaultConfigKey = Exclude<keyof PiCommonDefaultConfig, 'type'>;
