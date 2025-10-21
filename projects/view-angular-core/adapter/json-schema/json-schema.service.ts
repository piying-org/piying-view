import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { map, switchMap } from 'rxjs/operators';
import rfdc from 'rfdc';
import * as v from 'valibot';
import {
  asVirtualGroup,
  formConfig,
  hideWhen,
  patchProps,
} from '@piying/view-angular-core';
import * as jsonActions from '@piying/view-angular-core';
import { intersection, isBoolean, isNil, isUndefined, union } from 'es-toolkit';
import { BehaviorSubject } from 'rxjs';
import { schema as cSchema } from '@piying/valibot-visit';
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

function getMetadataAction(schema: JSONSchema7Ext) {
  const action = [];
  if ('title' in schema) {
    action.push(v.title(schema['title']!));
  }
  if ('description' in schema) {
    action.push(v.description(schema['description']!));
  }
  return action;
}
function getValidationAction(schema: JSONSchema7Ext) {
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

interface JSONSchema7Ext extends JSONSchema7 {
  actions?: { name: string; params: any[] }[];
}

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
function mergeSchema(schema: JSONSchema7, ...list: JSONSchema7Definition[]) {
  let base = clone(schema);
  let baseKeyList = Object.keys(base);
  const actionList = getValidationAction(base);
  for (const childSchema of list.filter(
    (item) => !isBoolean(item),
  ) as any as JSONSchema7[]) {
    actionList.push(...getValidationAction(childSchema));
    baseKeyList = union(baseKeyList, Object.keys(childSchema));
    for (const key of baseKeyList) {
      switch (key) {
        case 'type': {
          // 类型
          const typeResult = arrayIntersection(base.type, childSchema.type);
          if (typeResult.action) {
            actionList.push(typeResult.action);
          }
          if (!isUndefined(typeResult.value)) {
            childSchema.type = typeResult.value;
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

    base = childSchema;
  }
  return { schema: base, actionList };
}

interface IOptions {
  schema: JSONSchema7Ext;
}
// 应该传入定制
const WrapperList = [] as string[];
// const WrapperList = ['tooltip', 'jsonschema-label', 'validator'];
export function jsonSchemaToValibot(schema: JSONSchema7) {
  return new JsonSchemaToValibot(schema).convert() as ResolvedSchema;
}
export class JsonSchemaToValibot {
  root;
  private cacheSchema = new WeakMap();
  constructor(root: JSONSchema7) {
    this.root = root;
  }
  convert() {
    const schema = clone(this.root);
    const result = this.itemToVSchema2(schema);
    return result;
  }

  itemToVSchema(schema: JSONSchema7) {
    if (schema && schema.$ref) {
      schema = this.resolveDefinition(schema, { schema: this.root });
    }
    if (schema.allOf) {
      const result = mergeSchema(schema, ...schema.allOf);
      const resultList = this.jsonSchemaBase(result.schema)!;
      return v.pipe(resultList, ...result.actionList);
    }
    if (schema.anyOf && !isBoolean(schema.anyOf)) {
      const resultList = schema.anyOf.map((item) => {
        let result = mergeSchema(schema, item);
        const result2 = this.jsonSchemaBase(result.schema)!;
        return v.pipe(result2, ...result.actionList);
      });

      return v.pipe(
        cSchema.intersect(
          resultList.map((item) => {
            return v.optional(item);
          }),
        ),
        // 保证验证至少一个
        jsonActions.valueChange((fn) => {
          fn({
            list: resultList.map((_, i) => {
              return [i];
            }),
          }).subscribe(({ field }) => {
            let control = field.form.control! as jsonActions.FieldLogicGroup;
            let list = control.children$$().filter((item) => {
              return item.valid;
            });
            list = list.length === 0 ? control.children$$().slice(0, 1) : list;
            control.activateControls$.set(list);
          });
        }),
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          // 验证项全为可选,所以需要这里再次验证
          let hasSuccess = resultList.some((item) => {
            let result = v.safeParse(item, dataset.value);
            return result.success;
          });
          if (!hasSuccess) {
            addIssue();
          }
        }),
      );
    }
    if (schema.oneOf && !isBoolean(schema.oneOf)) {
      const resultList = schema.oneOf.map((item) => {
        let result = mergeSchema(schema, item);
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
          let hasSuccess = resultList.filter((item) => {
            let result = v.safeParse(item, dataset.value);
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
        this.jsonSchemaBase(schema),
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
        const ifSchema = mergeSchema(schema, schema.if!);
        ifVSchema = v.pipe(
          this.jsonSchemaBase(ifSchema.schema)!,
          ...ifSchema.actionList,
        );
      }
      let thenSchema: ResolvedSchema | undefined;
      if (schema.then && !isBoolean(schema.then)) {
        const subSchema = mergeSchema(schema, schema.then!);
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
        const subSchema = mergeSchema(schema, schema.else);
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

    return this.jsonSchemaBase(schema);
  }
  itemToVSchema2(schema: JSONSchema7Definition): ResolvedSchema | undefined {
    if (isBoolean(schema)) {
      return undefined;
    }
    const result = this.itemToVSchema(schema);
    this.cacheSchema.set(schema, result);
    return result;
  }
  allofParse(schema: JSONSchema7) {
    const list = schema.allOf!;
    const base = clone(schema);
    const baseActionList = getValidationAction(base);
    return list.map((item) =>
      isBoolean(item)
        ? undefined
        : [...baseActionList, ...getValidationAction(item)],
    );
  }
  private jsonSchemaBase(schema: JSONSchema7Ext) {
    const types = this.guessSchemaType(schema);
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
      case 'number':
      case 'integer': {
        return createTypeFn(v.number());
      }
      case 'boolean': {
        actionList.push(
          jsonActions.setWrappers(WrapperList),
          patchProps({ titlePosition: 'right' }),
        );
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
        const { requiredRelate, schemaDeps } = this.resolveDependencies(schema);
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
        const arrayConfig = this.#getArrayConfig(schema);
        if (!arrayConfig) {
          return v.lazy(() => createTypeFn(v.array(v.any())));
        }
        actionList.push(jsonActions.setWrappers(WrapperList));
        let parent:
          | v.ArraySchema<ResolvedSchema, undefined>
          | v.TupleWithRestSchema<ResolvedSchema[], ResolvedSchema, undefined>
          | v.LooseTupleSchema<ResolvedSchema[], undefined>;
        const fixedItems = arrayConfig.prefixItems;
        // tuple
        if (Array.isArray(fixedItems) && fixedItems.length) {
          const fixedList = fixedItems.map(
            (item) => this.itemToVSchema2(<JSONSchema7>item)!,
          );

          if (arrayConfig.items) {
            const result = this.itemToVSchema2(arrayConfig.items as any);
            parent = v.tupleWithRest(fixedList, result!);
          } else {
            parent = v.looseTuple(fixedList);
          }
          return createTypeFn(parent);
        } else if (arrayConfig.items) {
          const itemResult = this.itemToVSchema2(schema.items as any);
          parent = v.array(itemResult!);
        }
        // 校验
        if ('contains' in schema) {
          const containsSchema = this.itemToVSchema2(arrayConfig.items as any)!;
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
                  return result.length < (schema as any).maxContains;
                }

                return true;
              }
              return false;
            }),
          );
        }
        return v.lazy(() => createTypeFn(parent));
      }
      default:
        throw new Error(`未知类型:${type}`);
    }
  }

  private resolveDefinition(
    schema: JSONSchema7Ext,
    options: IOptions,
  ): JSONSchema7Ext {
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
    };
  }

  private resolveDependencies(schema: JSONSchema7) {
    const requiredRelate: { [id: string]: string[] } = {};
    const schemaDeps: { [id: string]: JSONSchema7 } = {};
    const dependentRequired = (dependency: string[], prop: string) => {
      dependency.forEach((dep) => {
        requiredRelate[dep] ??= [];
        requiredRelate[dep].push(prop);
      });
    };
    if ('dependencies' in schema) {
      Object.keys(schema.dependencies!).forEach((prop) => {
        const dependency = schema.dependencies![prop];
        if (Array.isArray(dependency)) {
          dependentRequired(dependency, prop);
        } else {
          schemaDeps[prop] = dependency as JSONSchema7;
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
        schemaDeps[prop] = dependency as JSONSchema7;
      });
    }

    return { requiredRelate, schemaDeps };
  }
  /** todo 当前只能存在一个类型 */
  private guessSchemaType(schema: JSONSchema7) {
    const type = schema?.type;
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

    return type
      ? { types: [type], optional: false }
      : { types: ['string'], optional: false };
  }

  #getArrayConfig(schema: JSONSchema7) {
    if ('prefixItems' in schema) {
      // 2020-12
      return {
        prefixItems: schema.prefixItems as
          | JSONSchema7Definition
          | JSONSchema7Definition[],
        items: schema.items as JSONSchema7Definition | undefined,
      };
    } else if ('items' in schema) {
      // 2019-09
      return {
        prefixItems: schema.items as
          | JSONSchema7Definition
          | JSONSchema7Definition[],
        items: schema.additionalItems,
      };
    }
    return undefined;
  }
}
