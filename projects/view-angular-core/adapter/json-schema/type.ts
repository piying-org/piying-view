import { JsonSchemaDraft202012Object } from '@hyperjump/json-schema/draft-2020-12';

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