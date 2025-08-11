import {
  _PiResolvedCommonViewFieldConfig,
  asyncInputMerge,
  mergeHooksFn,
} from '@piying/view-angular-core';
import { NgDirectiveConfig } from '../../type';
import { rawConfig } from './raw-config';
import { NgSchemaHandle } from '../ng-schema';
import { linkedSignal, signal } from '@angular/core';

export function setDirectives<T>(items: NgDirectiveConfig[]) {
  return rawConfig<T>((field) => {
    field.directives = items;
  });
}
export function patchDirectives<T>(items: NgDirectiveConfig[]) {
  return rawConfig<T>((field) => {
    field.directives ??= [];
    field.directives.push(...items);
  });
}
export function patchAsyncDirective<T>(
  fn: (
    field: _PiResolvedCommonViewFieldConfig,
  ) => Omit<NgDirectiveConfig, 'inputs'> & { inputs?: Record<string, any> },
) {
  return rawConfig<T>((field) => {
    mergeHooksFn<NgSchemaHandle>(
      {
        fieldResolved: (field) => {
          field.directives ??= signal([]);
          const directive = fn(field);
          const inputs = directive.inputs;
          let inputs$ = signal<Record<string, any>>({});
          if (inputs) {
            inputs$.set(
              Object.keys(inputs).reduce(
                (obj, key) => {
                  obj[key] = undefined;
                  return obj;
                },
                {} as Record<string, any>,
              ),
            );
            inputs$ = asyncInputMerge(inputs, inputs$);
          }
          const oldDirectives = field.directives;
          field.directives = linkedSignal(() => [
            ...oldDirectives(),
            { ...directive, inputs: inputs$ },
          ]);
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}
