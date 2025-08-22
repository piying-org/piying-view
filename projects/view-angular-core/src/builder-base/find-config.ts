import { inject, InjectionToken } from '@angular/core';
import { CoreRawWrapperConfig, PI_VIEW_CONFIG_TOKEN } from './type';
export const FindConfigToken = new InjectionToken<
  ReturnType<typeof FindConfigFactory>
>('FindConfig');
export function FindConfigFactory() {
  let globalConfig = inject(PI_VIEW_CONFIG_TOKEN);
  return {
    findWrapper: (wrapper: CoreRawWrapperConfig) => {
      let config;
      let type;
      if (typeof wrapper === 'string') {
        config = globalConfig?.wrappers?.[wrapper];
        type = wrapper;
      } else if (typeof wrapper.type === 'string') {
        config = globalConfig?.wrappers?.[wrapper.type];
        type = wrapper.type;
      } else {
        config = wrapper;
      }
      if (!config) {
        throw new Error(`🈳wrapper:[${type}]❗`);
      }
      return config;
    },
  };
}
