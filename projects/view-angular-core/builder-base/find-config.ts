import { inject, InjectionToken } from '@angular/core';
import { CoreRawWrapperConfig, PI_VIEW_CONFIG_TOKEN } from './type';
export const FindConfigToken = new InjectionToken<
  ReturnType<typeof FindConfigFactory>
>('FindConfig');
export function FindConfigFactory() {
  const globalConfig = inject(PI_VIEW_CONFIG_TOKEN);
  return {
    findWrapperComponent: (wrapper: any) => {
      let config;
      let type;
      if (typeof wrapper === 'string') {
        config = globalConfig?.wrappers?.[wrapper];
        if (!config) {
          throw new Error(`🈳wrapper:[${type}]❗`);
        }
        return config?.type;
      }
      return wrapper;
    },
    findWrapper: (wrapper: CoreRawWrapperConfig) => {
      let config;
      let type;
      if (typeof wrapper === 'string') {
        config = globalConfig?.wrappers?.[wrapper];
        type = wrapper;
      } else if (
        typeof wrapper === 'object' &&
        typeof wrapper.type === 'string'
      ) {
        const defaultConfig = globalConfig?.wrappers?.[wrapper.type];
        if (defaultConfig) {
          config = {
            type: defaultConfig.type,
            inputs: { ...defaultConfig.inputs, ...wrapper.inputs },
            attributes: { ...defaultConfig.attributes, ...wrapper.attributes },
            outputs: { ...defaultConfig.outputs, ...wrapper.outputs },
            events: wrapper.events,
          };
        }
        type = wrapper.type;
      } else {
        config = wrapper;
      }
      if (!config) {
        throw new Error(`🈳wrapper:[${type}]❗`);
      }
      return config;
    },
    findComponentConfig: (type: string | any) => {
      let define;
      let defaultConfig;
      if (typeof type === 'string') {
        const config = globalConfig?.types?.[type];
        if (!config) {
          throw new Error(`🈳define:[${type}]❗`);
        }
        defaultConfig = config;
        if (Object.keys(config).length) {
          define = {
            ...config,
          };
          return {
            define: { ...config },
            defaultConfig,
          };
        }
      } else {
        return { define: { type: type } };
      }
      return {
        define,
        defaultConfig,
      };
    },
  };
}
