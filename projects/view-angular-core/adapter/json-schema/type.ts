import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';
import * as v from 'valibot';

export interface JSONSchemaRaw extends JsonSchemaDraft202012Object {
  actions?: { name: string; params: any[] }[];
}
export interface JSONSchemaNoRef extends JSONSchemaRaw {
  __resolved: {
    hasRef: boolean;
  };
}
export type ResolvedJsonSchema = JSONSchemaNoRef & {
  __resolved: {
    type: {
      types: Extract<JsonSchemaDraft202012Object['type'], any[]>;
      optional: boolean;
    };
    isResolved: boolean;
  };
};

export type JSType = NonNullable<
  Exclude<JsonSchemaDraft202012Object['type'], any[]>
>;
export type OptionJSType = JSType | 'const' | 'enum';
export type BaseAction = v.BaseMetadata<any> | v.BaseValidation<any, any, any>;

export type ResolvedSchema =
  | v.BaseSchema<any, any, any>
  | v.SchemaWithPipe<
      // @ts-ignore // TODO: Remove comment
      readonly [
        v.BaseSchema<any, any, any>,
        ...(
          | v.BaseSchema<any, any, any>
          | v.PipeAction<any, any, v.BaseIssue<unknown>>
        )[],
      ]
    >;

/** 合并schema
 * 子级需要解析
 */
export interface TypeHandle {
  afterResolve: (
    vSchema: ResolvedSchema,
    jSchema: ResolvedJsonSchema,
    type: JSType | 'const' | 'enum',
  ) => ResolvedSchema | undefined;
}
export interface J2VOptions {
  customActions?: Record<
    string,
    (...args: any[]) => v.BaseMetadata<any> | v.BaseValidation<any, any, any>
  >;
  schemaHandle?: {
    type?: TypeHandle;
    afterResolve?: (
      vSchema: ResolvedSchema,
      jSchema: ResolvedJsonSchema,
    ) => ResolvedSchema | undefined;
  };
}
