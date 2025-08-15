import { EnvironmentInjector, Injectable, Injector } from '@angular/core';
import {
  _PiResolvedCommonViewFieldConfig,
  ConfigMergeStrategy,
  DefaultConfigKey,
  FormBuilder,
} from '@piying/view-angular-core';
import { SchemaOrPipe } from '@piying/valibot-visit';
import { convert } from '@piying/view-angular-core';
@Injectable()
class TestFormBuilder extends FormBuilder<any> {}
export function createBuilder(
  obj: SchemaOrPipe,
  options?: {
    context?: any;
    handle?: any;
    environments?: string[];
    types?: string[] | Record<string, any>;
    wrappers?: string[] | Record<string, any>;
    defaultConfigMergeStrategy?: Record<DefaultConfigKey, ConfigMergeStrategy>;
  },
) {
  const injector = Injector.create({
    providers: [
      {
        provide: EnvironmentInjector,
        useFactory: () => injector,
      },
    ],
  });
  const result = convert(obj, {
    injector,
    builder: TestFormBuilder,
    context: options?.context,
    handle: options?.handle,
    environments: options?.environments,
    fieldGlobalConfig: {
      types: {
        'mock-input': { type: Symbol() } as any,
        object: {} as any,
        array: {} as any,
        string: {} as any,
        boolean: {} as any,
        number: {} as any,
        intersect: {} as any,
        'intersect-group': {} as any,
        void: {} as any,
        null: {} as any,
        never: {} as any,
        picklist: {} as any,
        literal: {} as any,
        tuple: {} as any,
        enum: {} as any,
        record: {} as any,
        any: {} as any,
        custom: {} as any,
        union: {} as any,
        ...(Array.isArray(options?.types)
          ? options?.types?.reduce((obj, name) => {
              obj[name] = { type: name };
              return obj;
            }, {} as any)
          : (options?.types ?? {})),
      },
      wrappers: {
        ...(Array.isArray(options?.wrappers)
          ? options?.wrappers?.reduce((obj, name) => {
              obj[name] = { type: name };
              return obj;
            }, {} as any)
          : (options?.wrappers ?? {})),
      },
      defaultConfigMergeStrategy: options?.defaultConfigMergeStrategy,
    },
  });
  return result as _PiResolvedCommonViewFieldConfig;
}
