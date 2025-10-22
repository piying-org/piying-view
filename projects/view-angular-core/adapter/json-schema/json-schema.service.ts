import { map, switchMap } from 'rxjs/operators';
import rfdc from 'rfdc';
import * as v from 'valibot';
import { formConfig, hideWhen } from '@piying/view-angular-core';
import * as jsonActions from '@piying/view-angular-core';
import {
  intersection,
  isBoolean,
  isNil,
  isUndefined,
  union,
  uniq,
} from 'es-toolkit';
import { BehaviorSubject } from 'rxjs';
import { schema as cSchema } from '@piying/valibot-visit';
import {
  JsonSchemaDraft202012,
  JsonSchemaDraft202012Object,
} from '@hyperjump/json-schema/draft-2020-12';
import { JsonSchemaDraft07 } from '@hyperjump/json-schema/draft-07';
import { deepEqual } from 'fast-equals';
const anyType = [
  'object',
  'array',
  'string',
  'number',
  'boolean',
  'null',
  'integer',
] as Extract<JsonSchemaDraft202012Object['type'], any[]>;
function isConst(schema: JsonSchemaDraft202012Object) {
  return (
    typeof schema === 'object' &&
    (schema.hasOwnProperty('const') ||
      (schema.enum && schema.enum.length === 1))
  );
}
// todo 先按照类型不可变设计,之后修改代码支持组件变更
const clone = rfdc({ proto: false, circles: false });
type ResolvedSchema =
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

function getMetadataAction(schema: JSONSchemaRaw) {
  const action = [];
  if ('title' in schema) {
    action.push(v.title(schema['title']!));
  }
  if ('description' in schema) {
    action.push(v.description(schema['description']!));
  }
  return action;
}
function getValidationAction(schema: JSONSchemaRaw) {
  const action = [];

  // string
  if ('minLength' in schema) {
    action.push(v.minLength(schema['minLength']!));
  }
  // string
  if ('maxLength' in schema) {
    action.push(v.maxLength(schema['maxLength']!));
  }
  // string
  if ('pattern' in schema) {
    action.push(v.regex(new RegExp(schema['pattern']!)));
  }
  // todo format https://json-schema.org/understanding-json-schema/reference/type#built-in-formats
  // duration idn-email idn-hostname uri-reference iri iri-reference uri-template json-pointer regex
  if ('formt' in schema) {
    switch (schema.format) {
      case 'date-time': {
        action.push(v.isoDateTime());
        break;
      }
      case 'time': {
        action.push(v.isoTime());
        break;
      }
      case 'date': {
        action.push(v.isoDate());
        break;
      }
      case 'email': {
        action.push(v.email());
        break;
      }
      case 'ipv4': {
        action.push(v.ipv4());
        break;
      }
      case 'ipv6': {
        action.push(v.ipv6());
        break;
      }
      case 'uuid': {
        action.push(v.uuid());
        break;
      }
      case 'uri': {
        action.push(v.url());
        break;
      }

      default:
        break;
    }
  }
  // number
  if (
    'minimum' in schema &&
    'exclusiveMinimum' in schema &&
    (schema as any).exclusiveMinimum === true
  ) {
    action.push(v.gtValue(schema.minimum!));
  } else if ('exclusiveMinimum' in schema) {
    action.push(v.gtValue(schema.exclusiveMinimum!));
  } else if ('minimum' in schema) {
    action.push(v.minValue(schema.minimum!));
  }
  // number
  if (
    'maximum' in schema &&
    'exclusiveMaximum' in schema &&
    (schema as any).exclusiveMaximum === true
  ) {
    action.push(v.ltValue(schema.maximum!));
  } else if ('exclusiveMaximum' in schema) {
    action.push(v.ltValue(schema.exclusiveMaximum!));
  } else if ('maximum' in schema) {
    action.push(v.maxValue(schema.maximum!));
  }
  // number
  if ('multipleOf' in schema) {
    action.push(v.multipleOf(schema.multipleOf!));
  }
  // array
  if ('minItems' in schema) {
    action.push(v.minLength(schema.minItems!));
  }
  // array
  if ('maxItems' in schema) {
    action.push(v.maxLength(schema.maxItems!));
  }
  // array
  if ('uniqueItems' in schema) {
    action.push(
      v.check((input: any[]) => new Set(input).size === input.length),
    );
  }
  // object
  if ('maxProperties' in schema) {
    action.push(v.maxEntries(schema.maxProperties!));
  }
  // object
  if ('minProperties' in schema) {
    action.push(v.minEntries(schema.minProperties!));
  }
  if ('actions' in schema) {
    for (const rawAction of schema.actions!) {
      action.push(
        (jsonActions as any)[rawAction.name].apply(undefined, rawAction.params),
      );
    }
  }

  return action;
}

interface JSONSchemaRaw extends JsonSchemaDraft202012Object {
  actions?: { name: string; params: any[] }[];
}
type ResolvedJsonSchema = JSONSchemaRaw & {
  resolved: {
    objectDep?: ReturnType<JsonSchemaToValibot['resolveDependencies']>;
    type: {
      types: Extract<JsonSchemaDraft202012Object['type'], any[]>;
      optional: boolean;
    };
  };
};
function arrayIntersection(a: any, b: any) {
  if (!isNil(a) && !isNil(b)) {
    a = Array.isArray(a) ? a : [a];
    b = Array.isArray(b) ? b : [b];
    if (a.length && b.length) {
      if (intersection(a, b).length === 0) {
        return {
          action: v.check(() => false, 'conflict'),
          value: undefined,
        };
      }
    }
    return {
      value: a.length ? a : b,
    };
  }
  return { value: a ?? b };
}
/** 合并schema
 * 子级需要解析
 */

interface IOptions {
  schema: JSONSchemaRaw;
}
// 应该传入定制
const WrapperList = [] as string[];
// const WrapperList = ['tooltip', 'jsonschema-label', 'validator'];
export function jsonSchemaToValibot(schema: JSONSchemaRaw) {
  return new JsonSchemaToValibot(schema).convert() as ResolvedSchema;
}
const Schema2012 = 'https://json-schema.org/draft/2020-12/schema';
export class JsonSchemaToValibot {
  root;
  private cacheSchema = new WeakMap();
  constructor(root: JSONSchemaRaw) {
    this.root = root;
    root.$schema ??= Schema2012;
  }
  convert() {
    const schema = clone(this.root);
    const result = this.itemToVSchema2(schema);
    return result;
  }

  itemToVSchema(schema: JsonSchemaDraft202012Object) {
    if (schema && schema.$ref) {
      schema = this.resolveDefinition(schema, { schema: this.root });
    }
    if (schema.allOf) {
      const result = this.#mergeSchema(schema, ...schema.allOf);
      const resultList = this.jsonSchemaBase(result.schema)!;
      return v.pipe(resultList, ...result.actionList);
    }
    if (schema.anyOf && !isBoolean(schema.anyOf)) {
      const resolved = this.#resolveJsonSchema(schema);
      return this.anyOfCreate(resolved);
    }
    if (schema.oneOf && !isBoolean(schema.oneOf)) {
      const resultList = schema.oneOf.map((item) => {
        const result = this.#mergeSchema(schema, item);
        const result2 = this.jsonSchemaBase(result.schema)!;
        return v.pipe(result2, ...result.actionList);
      });

      return v.pipe(
        v.union(resultList),
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          // 验证项全为可选,所以需要这里再次验证
          const hasSuccess = resultList.filter((item) => {
            const result = v.safeParse(item, dataset.value);
            return result.success;
          });
          if (hasSuccess.length !== 1) {
            addIssue();
          }
        }),
      );
    }
    if ('if' in schema) {
      const baseActionList = getValidationAction(schema);
      const status$ = new BehaviorSubject<boolean | undefined>(undefined);
      const baseSchema = v.pipe(
        this.jsonSchemaBase(this.#resolveJsonSchema(schema)),
        ...baseActionList,
        hideWhen({
          disabled: false,
          listen: (fn) =>
            fn({}).pipe(
              map(({ list: [value], field }) => {
                const isThen =
                  ifVSchema.type === 'literal'
                    ? (ifVSchema as any).literal
                    : v.safeParse(ifVSchema, value).success;
                (
                  field.form.parent as jsonActions.FieldLogicGroup
                ).activateIndex$.set(isThen ? 1 : 2);
                status$.next(isThen);
                return !((isThen && !thenSchema) || (!isThen && !elseSchema));
              }),
            ),
        }),
      );
      let ifVSchema: ResolvedSchema;
      if (isBoolean(schema.if)) {
        ifVSchema = v.literal(schema.if);
      } else {
        const ifSchema = this.#mergeSchema(schema, schema.if!);
        ifVSchema = v.pipe(
          this.jsonSchemaBase(ifSchema.schema)!,
          ...ifSchema.actionList,
        );
      }
      let thenSchema: ResolvedSchema | undefined;
      if (schema.then && !isBoolean(schema.then)) {
        const subSchema = this.#mergeSchema(schema, schema.then!);
        thenSchema = v.pipe(
          this.jsonSchemaBase(subSchema.schema),
          ...subSchema.actionList,
          jsonActions.renderConfig({ hidden: true }),
          hideWhen({
            disabled: true,
            listen(fn, field) {
              return fn({ list: [['..', 0]] }).pipe(
                switchMap(({ list: [value] }) => status$),
                map((a) => (a === undefined ? true : !a)),
              );
            },
          }),
        );
      }
      let elseSchema: ResolvedSchema | undefined;

      if (schema.else && !isBoolean(schema.else)) {
        const subSchema = this.#mergeSchema(schema, schema.else);
        elseSchema = v.pipe(
          this.jsonSchemaBase(subSchema.schema),
          ...subSchema.actionList,
          jsonActions.renderConfig({ hidden: true }),
          hideWhen({
            disabled: true,
            listen(fn, field) {
              return fn({ list: [['..', 0]] }).pipe(
                switchMap(({ list: [value] }) => status$),
                map((a) => (a === undefined ? true : a)),
              );
            },
          }),
        );
      }

      // 这种逻辑没问题,因为jsonschema验证中,也会出现base和子级架构一起验证
      return v.pipe(
        v.union(
          [
            baseSchema,
            thenSchema ?? baseSchema,
            elseSchema ?? baseSchema,
          ].filter(Boolean),
        ),
        formConfig({ disableOrUpdateActivate: true }),
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          const status = status$.value;
          if (status && thenSchema) {
            const result = v.safeParse(thenSchema, dataset.value);
            if (!result.success) {
              addIssue();
              return;
            }
          }
          if (!status && elseSchema) {
            const result = v.safeParse(elseSchema, dataset.value);
            if (!result.success) {
              addIssue();
              return;
            }
          }
        }),
      );
    }

    return v.pipe(
      this.jsonSchemaBase(this.#resolveJsonSchema(schema)),
      ...getValidationAction(schema),
    );
  }
  itemToVSchema2(schema: JsonSchemaDraft202012): ResolvedSchema | undefined {
    if (isBoolean(schema)) {
      return undefined;
    }
    const result = this.itemToVSchema(schema);
    this.cacheSchema.set(schema, result);
    return result;
  }

  #resolveJsonSchema(schema: JsonSchemaDraft202012Object) {
    if ('resolved' in schema) {
      return schema as any as ResolvedJsonSchema;
    }
    const resolved = schema as any as ResolvedJsonSchema;
    const type = this.guessSchemaType(schema);
    resolved.resolved = { type };
    if (type.types.includes('object')) {
      resolved.resolved['objectDep'] = this.resolveDependencies(schema);
    }
    if (type.types.includes('array')) {
      const arrayItem = this.#getArrayConfig(schema);
      resolved.prefixItems = arrayItem?.prefixItems;
      resolved.items = arrayItem?.items;
    }
    return resolved;
  }

  private jsonSchemaBase(schema: ResolvedJsonSchema) {
    const types = schema.resolved.type;
    // 暂时为只支持一个
    const type = types.types[0];
    const actionList: any[] = getMetadataAction(schema);

    const createTypeFn = <T extends v.BaseSchema<any, any, any>>(input: T) => {
      const opInput = types.optional
        ? v.optional(input, schema.default)
        : input;
      return v.pipe(opInput, ...actionList);
    };
    if (!isNil(schema.const)) {
      return createTypeFn(v.literal(schema.const! as any));
    }
    if (Array.isArray(schema.enum)) {
      return createTypeFn(v.picklist(schema.enum as any));
    }
    switch (type) {
      case 'number': {
        return createTypeFn(v.number());
      }
      case 'integer': {
        actionList.push(v.integer());
        return createTypeFn(v.number());
      }
      case 'boolean': {
        return createTypeFn(v.boolean());
      }
      case 'string': {
        actionList.push(jsonActions.setWrappers(WrapperList));
        return createTypeFn(v.string());
      }
      case 'null': {
        return createTypeFn(v.optional(v.null(), null));
      }
      case 'object': {
        const childObject: Record<string, ResolvedSchema> = {};
        /** 附加 */
        let additionalRest;
        /** 正则附加 */
        let patternMapRest: Record<string, ResolvedSchema> | undefined;
        /** 属性名检查 */
        let propertyNamesRest;
        let mode = 'default';
        /** 条件显示 */
        const conditionList = [];
        // 关联
        const { requiredRelate, schemaDeps } = schema.resolved.objectDep!;
        // 普通属性
        if (schema.properties) {
          for (const key in schema.properties) {
            const itemSchema = schema.properties[key];
            const childResult = this.itemToVSchema2(itemSchema);
            const isRequired = !!schema.required?.includes(key);
            let item = childResult;
            if (!item) {
              throw new Error(`子级不存在`);
            }
            if (!isRequired && item.type !== 'optional') {
              item = v.optional(item);
            }
            // 条件必须
            const relateList = requiredRelate[key];
            if (relateList) {
              item = v.pipe(
                item,
                formConfig({
                  validators: [
                    (control) => {
                      const hasValid = relateList.some(
                        (item) => control.parent!.get(item)?.valid,
                      );
                      return hasValid
                        ? undefined
                        : { dependentRequired: `must required` };
                    },
                  ],
                }),
              );
            }
            childObject[key] = item;
          }
        }
        // 附加属性规则
        if (isBoolean(schema.additionalProperties)) {
          mode = schema.additionalProperties === false ? 'strict' : mode;
        } else if (schema.additionalProperties) {
          mode = 'rest';
          // rest要符合的规则
          additionalRest = this.itemToVSchema2(schema.additionalProperties!);
        }
        if (schema.patternProperties) {
          patternMapRest = {};
          for (const key in schema.patternProperties) {
            const item = this.itemToVSchema2(schema.patternProperties[key]);
            if (!item) {
              throw new Error(`patternProperties->${key}: 定义未找到`);
            }
            patternMapRest[key] = item;
          }
        }
        for (const key in schemaDeps) {
          const element = schemaDeps[key];
          let result = this.itemToVSchema2(element);
          if (!result) {
            throw new Error(`依赖->${key}: 定义未找到`);
          }
          result = v.pipe(
            result,
            hideWhen({
              disabled: true,
              listen: (fn, field) =>
                field
                  .get(['..', '..', 0, key])!
                  .form.control!.statusChanges.pipe(
                    map((item) => item === 'VALID'),
                  ),
            }),
          );
          conditionList.push(result);
        }

        if (schema.propertyNames) {
          propertyNamesRest = this.itemToVSchema2(schema.propertyNames);
        }
        let schemaDefine;
        if (mode === 'default') {
          if (conditionList.length) {
            schemaDefine = v.pipe(
              v.intersect([v.looseObject(childObject), ...conditionList]),
            );
          } else {
            schemaDefine = v.pipe(v.looseObject(childObject));
          }
        } else if (mode === 'strict') {
          if (conditionList.length) {
            schemaDefine = v.pipe(
              v.intersect([v.object(childObject), ...conditionList]),
            );
          } else {
            schemaDefine = v.pipe(v.object(childObject));
          }
        } else {
          // rest
          let restDefine = v.any() as NonNullable<ResolvedSchema>;
          //propCheck patternMapRest addonRest
          if (additionalRest) {
            restDefine = additionalRest;
          }
          if (patternMapRest) {
            // todo valibot目前不支持rest key
          }
          if (propertyNamesRest) {
            // todo valibot目前不支持rest key
          }

          if (conditionList.length) {
            schemaDefine = v.pipe(
              v.intersect([
                v.objectWithRest(childObject, restDefine),
                ...conditionList,
              ]),
            );
          } else {
            schemaDefine = v.pipe(v.objectWithRest(childObject, restDefine));
          }
        }
        return createTypeFn(schemaDefine);
      }
      case 'array': {
        if (!schema.items && !schema.prefixItems) {
          return v.lazy(() => createTypeFn(v.array(v.any())));
        }
        actionList.push(jsonActions.setWrappers(WrapperList));
        let parent: v.BaseSchema<any, any, any> | undefined;
        const fixedItems = schema.prefixItems;
        if (Array.isArray(fixedItems) && fixedItems.length) {
          const fixedList = fixedItems.map(
            (item) => this.itemToVSchema2(<JsonSchemaDraft202012Object>item)!,
          );

          if (schema.items) {
            const result = this.itemToVSchema2(schema.items as any);
            parent = v.tupleWithRest(fixedList, result!);
          } else if (schema.items === false) {
            parent = v.tuple(fixedList);
          } else {
            parent = v.looseTuple(fixedList);
          }
          return createTypeFn(parent);
        } else if (schema.items) {
          const itemResult = this.itemToVSchema2(schema.items as any);
          parent = v.array(itemResult!);
        }
        // 校验
        if ('contains' in schema) {
          const containsSchema = this.itemToVSchema2(schema.contains as any)!;
          const minContains = (schema as any).minContains ?? 1;
          actionList.push(
            v.check((list) => {
              if (Array.isArray(list)) {
                const result = list.filter(
                  (item) => v.safeParse(containsSchema, item).success,
                );
                if (result.length < minContains) {
                  return false;
                }

                if (typeof (schema as any).maxContains === 'number') {
                  return result.length <= (schema as any).maxContains;
                }

                return true;
              }
              return false;
            }),
          );
        }
        return v.lazy(() => createTypeFn(parent!));
      }
      default:
        throw new Error(`未知类型:${type}`);
    }
  }

  private resolveDefinition(
    schema: JSONSchemaRaw,
    options: IOptions,
  ): JSONSchemaRaw {
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
            options.schema,
          );

    if (!definition) {
      throw Error(`Cannot find a definition for ${schema.$ref}.`);
    }

    if (definition.$ref) {
      return this.resolveDefinition(definition, options);
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
    };
  }

  private resolveDependencies(schema: JsonSchemaDraft202012Object) {
    const requiredRelate: { [id: string]: string[] } = {};
    const schemaDeps: { [id: string]: JsonSchemaDraft202012Object } = {};
    const dependentRequired = (dependency: string[], prop: string) => {
      dependency.forEach((dep) => {
        requiredRelate[dep] ??= [];
        requiredRelate[dep].push(prop);
      });
    };
    if ('dependencies' in schema) {
      const dependencies = schema.dependencies as Record<
        string,
        JsonSchemaDraft07 | string[]
      >;
      Object.keys(dependencies).forEach((prop) => {
        const dependency = dependencies![prop];
        if (Array.isArray(dependency)) {
          dependentRequired(dependency, prop);
        } else {
          schemaDeps[prop] = dependency as JsonSchemaDraft202012Object;
        }
      });
    }
    if ('dependentRequired' in schema) {
      Object.keys(schema.dependentRequired || {}).forEach((prop) => {
        const dependency = (schema.dependentRequired as any)![prop];
        dependentRequired(dependency, prop);
      });
    }
    if ('dependentSchemas' in schema) {
      Object.keys(schema.dependentSchemas || {}).forEach((prop) => {
        const dependency = (schema.dependentSchemas as any)![prop];
        schemaDeps[prop] = dependency as JsonSchemaDraft202012Object;
      });
    }

    return { requiredRelate, schemaDeps };
  }
  /** todo 当前只能存在一个类型 */
  private guessSchemaType(
    schema: JsonSchemaDraft202012Object,
  ): ResolvedJsonSchema['resolved']['type'] {
    let type = schema?.type;
    if (!type && schema?.properties) {
      return { types: ['object'], optional: false };
    }

    if (Array.isArray(type)) {
      if (type.length === 1) {
        return { types: type, optional: false };
      }
      const nullIndex = type.findIndex((item) => item === 'null');
      if (nullIndex !== -1) {
        type.splice(nullIndex, 1);
      }
      return {
        types: type,
        optional: nullIndex !== -1,
      };
    }
    if (schema.items || schema.prefixItems) {
      type = 'array';
    }

    return type
      ? { types: [type], optional: false }
      : { types: anyType, optional: false };
  }

  #getArrayConfig(schema: JsonSchemaDraft202012Object) {
    if (this.root.$schema === Schema2012) {
      if (!isNil((schema as any).prefixItems) || !isNil(schema.items)) {
        return {
          prefixItems: (schema as any).prefixItems as
            | JsonSchemaDraft202012[]
            | undefined,
          items: schema.items as JsonSchemaDraft202012 | undefined,
        };
      }
    } else {
      if (!isNil(schema.items) || !isNil(schema.additionalItems)) {
        // 2019-09
        return {
          prefixItems: schema.items as JsonSchemaDraft202012[] | undefined,
          items: schema.additionalItems as JsonSchemaDraft202012 | undefined,
        };
      }
    }
    return;
  }

  #mergeSchema(
    schema: JsonSchemaDraft202012Object,
    ...list: JsonSchemaDraft202012[]
  ) {
    let base = clone(schema);
    let baseKeyList = Object.keys(base);
    const actionList = getValidationAction(base);
    for (let childSchema of list.filter(
      (item) => !isBoolean(item),
    ) as any as JsonSchemaDraft202012Object[]) {
      if (childSchema && childSchema.$ref) {
        childSchema = this.resolveDefinition(childSchema, {
          schema: this.root,
        });
      }
      actionList.push(...getValidationAction(childSchema));
      baseKeyList = union(baseKeyList, Object.keys(childSchema));
      for (const key of baseKeyList) {
        switch (key) {
          case 'const': {
            childSchema[key] ??= base[key];
            break;
          }
          case 'type':
          case 'enum': {
            // 类型
            const typeResult = arrayIntersection(base[key], childSchema[key]);
            if (typeResult.action) {
              actionList.push(typeResult.action);
            }
            if (!isUndefined(typeResult.value)) {
              childSchema[key] = typeResult.value;
            }
            break;
          }

          case 'additionalProperties': {
            // 附加属性
            if (isUndefined(childSchema.additionalProperties)) {
              childSchema.additionalProperties = base.additionalProperties;
            }
            break;
          }
          case 'contains': {
            if (childSchema[key] === false || base[key] === false) {
              actionList.push(v.check(() => false));
              break;
            } else if (childSchema[key] === true) {
              childSchema[key] = base[key];
              break;
            } else if (base[key] === true) {
              break;
            }
            if (!isUndefined((childSchema as any)[key])) {
              (childSchema as any)[key] = {
                ...(base as any)[key],
                ...(childSchema as any)[key],
              };
            } else {
              (childSchema as any)[key] = (base as any)[key];
            }
            break;
          }
          case 'if':
          case 'then':
          case 'else':
          case 'patternProperties':
          case 'dependentSchemas':
          case 'propertyNames':
          case 'properties': {
            // 属性赋值
            if (!isUndefined((childSchema as any)[key])) {
              (childSchema as any)[key] = {
                ...(base as any)[key],
                ...(childSchema as any)[key],
              };
            } else {
              (childSchema as any)[key] = (base as any)[key];
            }
            break;
          }

          default:
            (childSchema as any)[key] ??= (base as any)[key];
            break;
        }
      }

      base = childSchema as any;
    }
    return { schema: this.#resolveJsonSchema(base), actionList };
  }
  resolveSchema2(schema: JsonSchemaDraft202012Object) {
    const result = this.resolveDefinition(schema, { schema: this.root });
    return this.#resolveJsonSchema(result);
  }
  arrayInclude(a: any[], b: any[]) {
    return b.filter((item) => a.some((item2) => deepEqual(item, item2)));
  }
  #parseEnum(schema: JsonSchemaDraft202012Object):
    | {
        type: string;
        data: JsonSchemaDraft202012Object;
      }
    | undefined {
    // 普通枚举
    if (schema.enum) {
      return {
        type: 'enum',
        data: {
          enum: schema.enum,
        },
      };
    } else if (schema.const) {
      return { type: 'const', data: { const: schema.const } };
    } else if (schema.items && !isBoolean(schema.items)) {
      const result = this.#parseEnum(schema.items);
      if (result?.data) {
        return {
          type: 'multiselect',
          data: {
            items: result.data,
          },
        };
      }
      return undefined;
    }
    return undefined;
  }
  intersectSchemaType(
    a: JsonSchemaDraft202012Object | undefined,
    b: JsonSchemaDraft202012Object,
  ) {
    const parent = a ? this.resolveSchema2(a) : undefined;
    b = parent ? this.#mergeSchema(parent, b).schema : b;
    const child = this.resolveSchema2(b);
    const parentEnum = parent ? this.#parseEnum(parent) : undefined;
    const childEnum = this.#parseEnum(child);
    if (parentEnum?.data.items && childEnum?.data.items) {
      const result = this.arrayInclude(
        (parentEnum.data.items! as JsonSchemaDraft202012Object).enum!,
        (childEnum.data.items! as JsonSchemaDraft202012Object).enum!,
      );
      if (result.length) {
        return {
          type: 'multiselect',
          data: {
            items: {
              enum: result,
            },
          } as JsonSchemaDraft202012Object,
        };
      }
    } else if (childEnum?.type === 'multiselect') {
      return childEnum;
    }

    // 枚举
    if (parentEnum?.data.enum && childEnum?.data.enum) {
      const result = this.arrayInclude(
        parentEnum.data.enum,
        childEnum.data.enum,
      );
      if (result.length) {
        return {
          type: 'enum',
          data: { enum: result } as JsonSchemaDraft202012Object,
        };
      }
    } else if (childEnum?.data.enum) {
      return childEnum;
    }
    // 常量
    if (isNil(parentEnum?.data.const) && !isNil(childEnum?.data.const)) {
      return childEnum;
    }
    // 类型
    const typeResult = parent?.resolved.type.types
      ? intersection(parent.resolved.type.types, child.resolved.type.types)
      : child.resolved.type.types;
    if (typeResult.length) {
      delete (child as any)['resolved'];
      const result = this.#resolveJsonSchema({
        ...child,
        type: typeResult[0],
      });
      return {
        type: typeResult[0],
        data: result,
      };
    }
    return;
  }
  schemaExtract(
    schema: ResolvedJsonSchema,
    ...childList: ResolvedJsonSchema[]
  ) {
    /** 所有子属性key */
    const childKeyList = uniq(
      childList.flatMap((item) => Object.keys(item.properties ?? {})),
    );
    if (!childKeyList.length) {
      // 无效返回
      return;
    }

    const conditionJSchema = {
      properties: {},
      additionalProperties: false,
    } as JsonSchemaDraft202012Object;
    const childConditionJSchemaList = childList.map(
      () => ({ properties: {} }) as JsonSchemaDraft202012Object,
    );
    const conditionKeyList = [];
    for (const key of childKeyList) {
      const parentItem = schema.properties?.[key] as any;
      //如果父级不存在这个属性,并且禁止添加,跳过
      // todo 还应该增加额外的匹配
      if (!parentItem && schema.additionalProperties === false) {
        continue;
      }
      // 所有子级都存在某个Key
      const keyExist = childList.every((item) => {
        const propItem = item.properties?.[key];
        // todo 对象应该先解析
        return propItem && !isBoolean(propItem) && propItem.type !== 'object';
      });
      if (!keyExist) {
        continue;
      }

      let currentType = undefined;
      const childPropList: JsonSchemaDraft202012Object[] = [];
      for (const sub of childList) {
        const result = this.intersectSchemaType(
          schema?.properties?.[key] as any,
          sub.properties![key] as any,
        );
        if (!result) {
          currentType = undefined;
          break;
        } else if (
          currentType === undefined ||
          deepEqual(currentType, result.type)
        ) {
          currentType = result.type;
          // 枚举
          if (
            result.data!.enum ||
            'const' in result.data! ||
            result.type === 'multiselect'
          ) {
            childPropList.push(result.data!);
          } else {
            childPropList.push(result.data as any);
          }
        } else {
          break;
        }
      }

      if (currentType) {
        conditionKeyList.push(key);
        for (let index = 0; index < childConditionJSchemaList.length; index++) {
          const schema = childConditionJSchemaList[index];
          schema.properties![key] = childPropList[index];
        }
        if (currentType === 'enum') {
          conditionJSchema.properties![key] = {
            enum: childPropList.flatMap((item) => item.enum!),
          };
        } else if (currentType === 'const') {
          conditionJSchema.properties![key] = {
            enum: childPropList.flatMap((item) => item.const!),
          };
        } else if (currentType === 'multiselect') {
          conditionJSchema.properties![key] = {
            type: 'array',
            items: {
              enum: childPropList.flatMap(
                (item) => (item.items as JsonSchemaDraft202012Object)!.enum!,
              ),
            },
            uniqueItems: true,
          };
        } else {
          conditionJSchema.properties![key] = {
            type: currentType as any,
          };
        }
      }
    }
    return { conditionJSchema, childConditionJSchemaList, conditionKeyList };
  }

  anyOfCreate(schema: ResolvedJsonSchema) {
    const resolvedChildList = schema.anyOf!.map((item) =>
      this.#mergeSchema(schema, item),
    );
    const resolvedChildJSchemaList = resolvedChildList.map(
      (item) => item.schema,
    );
    const isObject = [schema, ...resolvedChildJSchemaList].every((item) =>
      item.resolved.type.types.includes('object'),
    );
    // 仅处理object,实现条件显示
    if (isObject) {
      const conditionResult = this.schemaExtract(
        schema,
        ...resolvedChildJSchemaList,
      );

      if (conditionResult) {
        const childConditionVSchemaList =
          conditionResult.childConditionJSchemaList.map((schema) => {
            const rSchema = this.#resolveJsonSchema(schema);
            return v.pipe(
              this.jsonSchemaBase(rSchema),
              ...getValidationAction(rSchema),
            );
          });
        let activateList: boolean[] = [];
        const conditionVSchema = v.pipe(
          this.jsonSchemaBase(
            this.#resolveJsonSchema(conditionResult.conditionJSchema),
          ),
          jsonActions.valueChange((fn) => {
            fn().subscribe(({ list: [value], field }) => {
              activateList = [];
              const parent = field.get(['..'])!.form
                .control as any as jsonActions.FieldLogicGroup;
              const parentAList = parent!.children$$().slice(0, 2);

              for (
                let index = 0;
                index < childConditionVSchemaList.length;
                index++
              ) {
                const schema = childConditionVSchemaList[index];
                const result = v.safeParse(schema, value);
                const childIndex = index + 2;
                activateList.push(result.success);
                field.get(['..', childIndex])?.renderConfig.update((data) => ({
                  ...data,
                  hidden: !result.success,
                }));
                if (result.success) {
                  parentAList.push(parent!.children$$!()[childIndex]);
                }
              }
              parent.activateControls$.set(parentAList);
            });
          }),
        );
        conditionResult.conditionKeyList.forEach((key) => {
          resolvedChildJSchemaList.forEach((item) => {
            delete item.properties![key];
          });
          delete schema.properties?.[key];
        });
        const baseActionList = getValidationAction(schema);
        const baseSchema = v.pipe(
          this.jsonSchemaBase(schema),
          ...baseActionList,
        );
        const childSchemaList = resolvedChildJSchemaList.map((item) => {
          const result = this.jsonSchemaBase(item);
          return v.pipe(result);
        });
        return v.pipe(
          cSchema.intersect([
            conditionVSchema,
            baseSchema,
            ...childSchemaList.map((item) =>
              v.pipe(
                v.optional(item),
                jsonActions.renderConfig({ hidden: true }),
              ),
            ),
          ]),
          jsonActions.setComponent('anyOf-condition'),
          v.rawCheck(({ dataset, addIssue }) => {
            if (dataset.issues) {
              return;
            }
            // 验证项全为可选,所以需要这里再次验证
            const hasSuccess = childSchemaList.some((item, index) => {
              const isActive = activateList[index];
              if (!isActive) {
                return false;
              }
              const result = v.safeParse(item, dataset.value);
              return result.success;
            });
            if (!hasSuccess) {
              addIssue();
            }
          }),
        );
      }
    }
    const baseActionList = getValidationAction(schema);
    const baseSchema = v.pipe(this.jsonSchemaBase(schema), ...baseActionList);
    const childSchemaList = resolvedChildList.map((item) => {
      const result = this.jsonSchemaBase(item.schema);
      return v.pipe(result, ...item.actionList);
    });
    return v.pipe(
      baseSchema,
      v.rawCheck(({ dataset, addIssue }) => {
        if (dataset.issues) {
          return;
        }
        // 验证项全为可选,所以需要这里再次验证
        const hasSuccess = childSchemaList.some((item) => {
          const result = v.safeParse(item, dataset.value);
          return result.success;
        });
        if (!hasSuccess) {
          addIssue();
        }
      }),
    );
  }
}
