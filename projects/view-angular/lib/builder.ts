import {
  PiComponentDefaultConfig,
  PiResolvedViewFieldConfig,
  ConfigMergeStrategyObject,
  PiViewConfig,
  NgResolvedComponentDefine1,
} from './type';
import { inject, Injectable, Type } from '@angular/core';

import { FormBuilder, PI_VIEW_CONFIG_TOKEN } from '@piying/view-angular-core';
import { NG_CONFIG_DEFAULT_MERGE_STRAGEGY } from './const';
import { NgSchemaHandle } from './schema/ng-schema';

@Injectable()
export class AngularFormBuilder extends FormBuilder<NgSchemaHandle> {
  #globalConfig: PiViewConfig = inject(PI_VIEW_CONFIG_TOKEN) as any;
  override afterResolveConfig(
    rawConfig: NgSchemaHandle,
    config: PiResolvedViewFieldConfig,
  ): PiResolvedViewFieldConfig {
    const field = rawConfig;
    const type = rawConfig.type;
    let componentDefaultConfig: PiComponentDefaultConfig | undefined;
    const mergeStrategy = this.#globalConfig
      .defaultConfigMergeStrategy as ConfigMergeStrategyObject;

    if (type) {
      const result = this.#resolveComponent(type);
      componentDefaultConfig = result.defaultConfig;
    }

    const directives = this.configMerge(
      [componentDefaultConfig?.directives, field.directives],
      true,
      mergeStrategy?.directives ?? NG_CONFIG_DEFAULT_MERGE_STRAGEGY.directives,
    );
    config.directives = directives;
    return config;
  }

  #resolveComponent(type: string | Type<any> | (() => Promise<Type<any>>)) {
    let define;
    let defaultConfig;
    // 查引用
    if (typeof type === 'string') {
      const config = this.#globalConfig.types?.[type];
      if (!config) {
        throw new Error(`未注册${type}`);
      }
      defaultConfig = config;
      if (Object.keys(config).length) {
        define = {
          ...config,
        } as NgResolvedComponentDefine1;
      }
    } else {
      // 直接使用视为独立组件,并且selector只有一个
      define = { type } as NgResolvedComponentDefine1;
    }
    return {
      define,
      defaultConfig,
    };
  }
}
