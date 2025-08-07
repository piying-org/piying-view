import {
  AnyCoreSchemaHandle,
  CoreSchemaHandle,
} from './handle/core.schema-handle';

import {
  convertCore,
  ConvertOptions,
  SchemaOrPipe,
} from '@piying/valibot-visit';
import { computed, EnvironmentInjector, Injector, signal } from '@angular/core';
import {
  PI_FORM_BUILDER_OPTIONS_TOKEN,
  PI_VIEW_CONFIG_TOKEN,
  PiCommonConfig,
  PiResolvedCommonViewFieldConfig,
  FormBuilder,
  FormBuilderOptions,
  PI_CONTEXT_TOKEN,
} from '../builder-base';
import { FieldGroup } from '../field/field-group';
import { SetOptional } from '../util';
export function convert<
  RESULT extends Omit<PiResolvedCommonViewFieldConfig<any, any>, 'define'>,
>(
  obj: SchemaOrPipe,
  options: SetOptional<ConvertOptions, 'handle'> & {
    injector: Injector;
    builder: typeof FormBuilder;
    fieldGlobalConfig?: PiCommonConfig;
    registerOnDestroy?: (fn: any) => void;
  },
) {
  const buildOptions: FormBuilderOptions<RESULT> = {
    form$$: computed<FieldGroup>(
      () => buildOptions.resolvedField$()?.form.control as any,
    ),
    resolvedField$: signal(undefined as any),
    context: options.context,
  };
  const injector = Injector.create({
    providers: [
      {
        provide: PI_FORM_BUILDER_OPTIONS_TOKEN,
        useValue: buildOptions,
      },
      {
        provide: PI_VIEW_CONFIG_TOKEN,
        useValue: options.fieldGlobalConfig ,
      },
      {
        provide: PI_CONTEXT_TOKEN,
        useValue: options.context,
      },
      options.builder,
      { provide: EnvironmentInjector, useFactory: () => injector },
    ],
    parent: options.injector,
  });
  options.registerOnDestroy?.(() => {
    injector.get(EnvironmentInjector).destroy();
  });
  return convertCore(
    obj,
    (item: AnyCoreSchemaHandle) => {
      // todo
      injector.get(options.builder).buildRoot({
        field: item,
        resolvedField$: buildOptions.resolvedField$,
      });
      return buildOptions.resolvedField$();
    },
    {
      ...options,
      handle: options?.handle ?? (CoreSchemaHandle as any),
    },
  );
}
