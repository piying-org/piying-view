import { EnvironmentInjector, Injectable, Injector } from '@angular/core';
import {
  _PiResolvedCommonViewFieldConfig,
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
    builder?: any;
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
  const MockType = { type: Symbol() } as any;
  const result = convert(obj, {
    injector,
    builder: options?.builder ?? TestFormBuilder,
    context: options?.context,
    handle: options?.handle,
    environments: options?.environments,
    fieldGlobalConfig: {
      types: {
        'mock-input': MockType as any,
        object: MockType as any,
        strict_object: MockType as any,
        array: MockType as any,
        string: MockType as any,
        boolean: MockType as any,
        number: MockType as any,
        intersect: MockType as any,
        'intersect-group': MockType as any,
        void: MockType as any,
        null: MockType as any,
        never: MockType as any,
        picklist: MockType as any,
        literal: MockType as any,
        tuple: MockType as any,
        enum: MockType as any,
        record: MockType as any,
        any: MockType as any,
        custom: MockType as any,
        union: MockType as any,
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
    },
  });
  return result as _PiResolvedCommonViewFieldConfig;
}
