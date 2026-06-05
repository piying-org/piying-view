import {
  computed,
  DestroyRef,
  InjectionToken,
  Injector,
  Provider,
  signal,
} from '@angular/core';
import { CoreOptions } from './form-convert';
import * as v from 'valibot';
import { SetOptional, SetRequired } from '../util';
import {
  FormBuilderOptions,
  PI_CONTEXT_TOKEN,
  PI_FORM_BUILDER_OPTIONS_TOKEN,
  PI_VIEW_CONFIG_TOKEN,
} from '../builder-base';
import { convertCore } from '@piying/valibot-visit';
import {
  FindConfigToken,
  FindConfigFactory,
} from '../builder-base/find-config';
import {
  AnyCoreSchemaHandle,
  CoreSchemaHandle,
} from './handle/core.schema-handle';
import { FieldGroup } from '../field/field-group';

export const PI_INPUT_OPTIONS_TOKEN = new InjectionToken<
  () => SetOptional<CoreOptionsWithoutInjector, 'builder'>
>('PI_INPUT_OPTIONS');
export const PI_INPUT_SCHEMA_TOKEN = new InjectionToken<
  () => v.BaseSchema<any, any, any>
>('PI_INPUT_SCHEMA');
export type CoreOptionsWithoutInjector = SetOptional<CoreOptions, 'injector'>;
export type ConvertFactoryOptions = SetOptional<
  CoreOptionsWithoutInjector,
  'builder'
>;
export type ConvertOptions = SetOptional<ConvertFactoryOptions, 'handle'>;

/** 创建 convertToField 函数的工厂 */
export function createConvertToField(
  defaultOptions: SetRequired<Partial<CoreOptions>, 'builder'>,
  defaultInjector?: Injector,
) {
  return <T extends v.BaseSchema<any, any, any>>(
    schema: () => T,
    parent?: Injector,
    options?: () => ConvertFactoryOptions | undefined,
    providers?: Provider[],
  ) => {
    const parent2 = (parent ?? defaultInjector)!;
    const options2 = {
      ...defaultOptions,
      ...options?.(),
    };

    const buildOptions: FormBuilderOptions<any> = {
      form$$: computed<FieldGroup>(
        () => buildOptions.resolvedField$()?.form.control as any,
      ),
      resolvedField$: signal(undefined as any),
      context: options2.context,
    };
    const injector = Injector.create({
      providers: [
        { provide: PI_INPUT_OPTIONS_TOKEN, useValue: options },
        { provide: PI_INPUT_SCHEMA_TOKEN, useValue: schema },
        {
          provide: PI_FORM_BUILDER_OPTIONS_TOKEN,
          useValue: buildOptions,
        },
        {
          provide: PI_VIEW_CONFIG_TOKEN,
          useValue: options2.fieldGlobalConfig,
        },
        {
          provide: PI_CONTEXT_TOKEN,
          useValue: options2.context,
        },
        { provide: FindConfigToken, useFactory: FindConfigFactory },
        options2.builder,
        ...(providers ?? []),
      ],
      parent: parent2,
    });
    parent2.get(DestroyRef).onDestroy(() => {
      injector.destroy();
    });

    return convertCore(
      schema(),
      (item: AnyCoreSchemaHandle) => {
        // todo
        injector.get(options2.builder).buildRoot({
          field: item,
          resolvedField$: buildOptions.resolvedField$,
        });
        return buildOptions.resolvedField$();
      },
      {
        ...options2,
        handle: options2?.handle ?? (CoreSchemaHandle as any),
        additionalData: {
          defaultWrapperMetadataGroup: options2.fieldGlobalConfig?.wrappers,
          injector,
        },
        defaultMetadataActionsGroup: Object.keys(
          options2.fieldGlobalConfig?.types ?? {},
        ).reduce(
          (obj, item) => {
            const { actions } = options2.fieldGlobalConfig!.types![item];
            if (actions) {
              obj[item] = actions;
            }
            return obj;
          },
          {} as Record<string, v.BaseMetadata<any>[]>,
        ),
      },
    );
  };
}
