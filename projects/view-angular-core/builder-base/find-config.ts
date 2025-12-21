import { inject, InjectionToken } from '@angular/core';
import { PI_VIEW_CONFIG_TOKEN } from './type';
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
    findComponentConfig: (type: string | any) => {
      if (typeof type === 'string') {
        const config = globalConfig?.types?.[type];
        if (!config) {
          throw new Error(`🈳define:[${type}]❗`);
        }
        return config.type;
      } else {
        return type;
      }
    },
  };
}
