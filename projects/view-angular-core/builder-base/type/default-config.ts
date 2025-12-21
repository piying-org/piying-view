import { BaseMetadata } from 'valibot';
import { LazyImport } from '../../util';
import {
  CoreWrapperConfig1,
  PiCommonDefaultConfig,
} from './common-field-config';
import { RawConfigAction } from '@piying/valibot-visit';
export interface PiCommonConfig {
  types?: Record<string, PiCommonDefaultConfig>;
  wrappers?: Record<
    string,
    Omit<CoreWrapperConfig1, 'type'> & {
      type: any | LazyImport<any>;
      actions?: RawConfigAction<'rawConfig', any, any>[];
    }
  >;
}

export type DefaultConfigKey = Exclude<
  keyof PiCommonDefaultConfig,
  'type' | 'actions'
>;
