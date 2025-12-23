import { BaseMetadata } from 'valibot';
import { RawConfigAction } from '@piying/valibot-visit';
export interface PiCommonConfig<C = any, W = any> {
  types?: Record<
    string,
    {
      type?: C;
      actions?: BaseMetadata<any>[];
    }
  >;
  wrappers?: Record<
    string,
    {
      type: W;
      actions?: RawConfigAction<'viewRawConfig', any, any>[];
    }
  >;
}
