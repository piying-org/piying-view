import { isBoolean, isNil, isString } from 'es-toolkit';
import type {
  JsonSchemaDraft202012,
  JsonSchemaDraft202012Object,
} from '@hyperjump/json-schema/draft-2020-12';
import type { JsonSchemaDraft07 } from '@hyperjump/json-schema/draft-07';
import {
  JSONSchemaRaw,
  ResolvedJsonSchema,
  JSONSchemaNoRef,
  ResolvedSchema,
  J2VOptions,
} from './type';
import { NumberTypeService } from './parse/number.service';
import { BaseTypeService } from './parse/base.service';
import { isNumber } from '../util/is-number';
import { IntegerTypeService } from './parse/integer.service';
import { BooleanTypeService } from './parse/boolean.service';
import { StringTypeService } from './parse/string.service';
import { NullTypeService } from './parse/null.service';
import { ConstTypeService } from './parse/const.service';
import { ObjectTypeService } from './parse/object.service';
import { ArrayTypeService } from './parse/array.service';
import { CommonTypeService } from './parse/common.service';
import { ListTypeService } from './parse/list.service';
import { PicklistTypeService } from './parse/picklist.service';

const anyType = [
  'object',
  'array',
  'string',
  'number',
  'boolean',
  'null',
  'integer',
] as Extract<JsonSchemaDraft202012Object['type'], any[]>;

// 应该传入定制

export function jsonSchemaToValibot(
  schema: Record<string, any>,
  options?: J2VOptions,
) {
  return new JsonSchemaToValibot(schema, options).convert() as ResolvedSchema;
}
const Schema2012 = 'https://json-schema.org/draft/2020-12/schema';
const TypeMap: Record<string, typeof BaseTypeService> = {
  number: NumberTypeService,
  integer: IntegerTypeService,
  boolean: BooleanTypeService,
  string: StringTypeService,
  null: NullTypeService,
  const: ConstTypeService,
  object: ObjectTypeService,
  array: ArrayTypeService,
  common: CommonTypeService,
  fixedList: ListTypeService,
  picklist: PicklistTypeService,
};
export class JsonSchemaToValibot {
  root;
  options;
  private cacheSchema = new WeakMap();
  constructor(root: JSONSchemaRaw, options?: J2VOptions) {
    this.root = root;
    this.options = options;
    root.$schema ??= Schema2012;
  }
  convert() {
    const Service = TypeMap['common'];
    const instance = new Service(this, this.root as any);
    return instance.parse([]);
  }

  #jsonSchemaCompatiable(schema: JsonSchemaDraft202012Object) {
    if ('__resolved' in schema && (schema.__resolved as any).isResolved) {
      return schema as any as ResolvedJsonSchema;
    }
    const resolved = schema as any as ResolvedJsonSchema;
    const type = this.#guessSchemaType(resolved);
    resolved.__resolved = { ...resolved.__resolved, type, isResolved: true };
    if (type.types.includes('object')) {
      this.#objectCompatible(resolved);
    }
    if (type.types.includes('array')) {
      this.#arrayCompatible(resolved);
    }
    if (type.types.includes('number') || type.types.includes('integer')) {
      if ((resolved.exclusiveMaximum as any) === true) {
        resolved.exclusiveMaximum = resolved.maximum;
        delete resolved.maximum;
      }
      if ((resolved.exclusiveMinimum as any) === true) {
        resolved.exclusiveMinimum = resolved.minimum;
        delete resolved.minimum;
      }
    }
    return resolved;
  }

  #resolveDefinition(schema: JSONSchemaRaw): JSONSchemaRaw {
    if (!schema.$ref) {
      return schema;
    }
    const [uri, pointer] = schema.$ref!.split('#/');
    if (uri) {
      throw Error(`Remote schemas for ${schema.$ref} not supported yet.`);
    }

    const definition = !pointer
      ? null
      : pointer
          .split('/')
          .reduce(
            (def, path) =>
              def?.hasOwnProperty(path) ? (def as any)[path] : null,
            this.root,
          );

    if (!definition) {
      throw Error(`Cannot find a definition for ${schema.$ref}.`);
    }

    if (definition.$ref) {
      return this.#resolveDefinition(definition);
    }

    return {
      ...definition,
      ...['title', 'description', 'default', 'actions'].reduce(
        (annotation, p) => {
          if (schema.hasOwnProperty(p)) {
            annotation[p] = (schema as any)[p];
          }

          return annotation;
        },
        {} as any,
      ),
      $ref: undefined,
      __resolved: {
        hasRef: true,
      },
    } as JSONSchemaNoRef;
  }

  /** todo 当前只能存在一个类型 */
  #guessSchemaType(
    schema: JsonSchemaDraft202012Object,
  ): ResolvedJsonSchema['__resolved']['type'] {
    let type = schema?.type;
    const optional = 'default' in schema;
    if (isString(type)) {
      return { types: [type], optional: optional };
    }
    if (Array.isArray(type)) {
      if (type.length === 1) {
        return { types: type, optional: optional };
      }
      const nullIndex = type.findIndex((item) => item === 'null');
      if (nullIndex !== -1) {
        type.splice(nullIndex, 1);
      }
      return {
        types: type,
        optional: optional || nullIndex !== -1,
      };
    }
    if (
      schema.items ||
      schema.prefixItems ||
      isNumber(schema.minContains) ||
      isNumber(schema.maxContains) ||
      !isNil(schema.contains) ||
      isBoolean(schema.uniqueItems)
    ) {
      type = 'array';
    } else if (
      isNumber(schema.minimum) ||
      isNumber(schema.maximum) ||
      isNumber(schema.exclusiveMaximum) ||
      isNumber(schema.exclusiveMinimum) ||
      isNumber(schema.multipleOf)
    ) {
      type = 'number';
    } else if (
      isNumber(schema.minLength) ||
      isNumber(schema.maxLength) ||
      isString(schema.pattern)
    ) {
      type = 'string';
    }

    return type
      ? { types: [type], optional: optional }
      : { types: anyType, optional: optional };
  }
  #objectCompatible(schema: JsonSchemaDraft202012Object) {
    if ('dependencies' in schema && schema.dependencies) {
      const dependencies = schema.dependencies as Record<
        string,
        JsonSchemaDraft07
      >;
      const dependentRequiredData = {} as Record<string, string[]>;
      const dependentSchemasData = {} as Record<string, JsonSchemaDraft202012>;
      Object.keys(dependencies).forEach((prop) => {
        const dependency = dependencies![prop];
        if (Array.isArray(dependency)) {
          dependentRequiredData[prop] = dependency;
        } else {
          dependentSchemasData[prop] = dependency as any;
        }
      });
      schema.dependentRequired = dependentRequiredData;
      schema.dependentSchemas = dependentSchemasData;
      delete schema.dependencies;
    }
  }

  #arrayCompatible(schema: JsonSchemaDraft202012Object) {
    if (this.root.$schema !== Schema2012 || !isNil(schema.additionalItems)) {
      if (!isNil(schema.items) || !isNil(schema.additionalItems)) {
        // 2019-09
        schema.prefixItems = schema.items as
          | JsonSchemaDraft202012[]
          | undefined;
        schema.items = schema.additionalItems as
          | JsonSchemaDraft202012
          | undefined;
      }
    }
    return;
  }

  resolveSchema2(schema: JsonSchemaDraft202012Object) {
    return this.#jsonSchemaCompatiable(this.#resolveDefinition(schema));
  }

  getTypeParser(type: string) {
    return TypeMap[type];
  }
}
