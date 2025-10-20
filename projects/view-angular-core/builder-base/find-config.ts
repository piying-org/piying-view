import { inject, InjectionToken } from '@angular/core';
import { CoreRawWrapperConfig, PI_VIEW_CONFIG_TOKEN } from './type';
export const FindConfigToken = new InjectionToken<
  ReturnType<typeof FindConfigFactory>
>('FindConfig');
export function FindConfigFactory() {
  const globalConfig = inject(PI_VIEW_CONFIG_TOKEN);
  return {
    findWrapper: (wrapper: CoreRawWrapperConfig) => {
      let config;
      let type;
      if (typeof wrapper === 'string') {
        config = globalConfig?.wrappers?.[wrapper];
        type = wrapper;
      } else if (typeof wrapper.type === 'string') {
        let defaultConfig = globalConfig?.wrappers?.[wrapper.type];
        config = {
          type: defaultConfig?.type,
          inputs: { ...defaultConfig?.inputs, ...wrapper.inputs },
          attributes: { ...defaultConfig?.attributes, ...wrapper.attributes },
          outputs: { ...defaultConfig?.outputs, ...wrapper.outputs },
        };
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
