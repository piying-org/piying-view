import { Injector, WritableSignal } from '@angular/core';

import { _PiResolvedCommonViewFieldConfig } from './common-field-config';
import { FieldGroup } from '../../field/field-group';
import { FieldArray } from '../../field/field-array';
import { CoreSchemaHandle, InjectorProvider } from '../../convert';

export interface BuildRootInputItem<
  SchemaHandle extends CoreSchemaHandle<any, any>,
> {
  field: SchemaHandle;
  resolvedField$: WritableSignal<_PiResolvedCommonViewFieldConfig | undefined>;
}
export interface BuildRootItem {
  type: 'root';
  field: {
    fieldGroup?: undefined;
    fullPath: [];
    injector: Injector;
    providers?: InjectorProvider[];
  };
  form?: undefined;
  resolvedField$: WritableSignal<_PiResolvedCommonViewFieldConfig | undefined>;
  append: (input: _PiResolvedCommonViewFieldConfig) => void;
}
export interface BuildGroupItem<
  SchemaHandle extends CoreSchemaHandle<any, any>,
> {
  type: 'group';
  templateField?: SchemaHandle;

  fields: SchemaHandle[];
  form: FieldGroup;
  field: _PiResolvedCommonViewFieldConfig;
  append: (input: _PiResolvedCommonViewFieldConfig) => void;
  skipAppend?: boolean;
}
export interface BuildArrayItem<
  SchemaHandle extends CoreSchemaHandle<any, any>,
> {
  type: 'array';
  templateField: SchemaHandle;
  fields: SchemaHandle[];
  form: FieldArray;
  field: _PiResolvedCommonViewFieldConfig;
  append: (input: _PiResolvedCommonViewFieldConfig) => void;
  skipAppend?: boolean;
}
