import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { map } from 'rxjs/operators';
import rfdc from 'rfdc';
import * as v from 'valibot';
import {
  asControl,
  formConfig,
  hideWhen,
  patchInputs,
  patchProps,
  setComponent,
  VALID,
} from '@piying/view-angular-core';
import * as jsonActions from '@piying/view-angular-core';
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
function objAndSameType(obj1: any, obj2: any) {
  return (
    isObject(obj1) &&
    isObject(obj2) &&
    Object.getPrototypeOf(obj1) === Object.getPrototypeOf(obj2) &&
    !(Array.isArray(obj1) || Array.isArray(obj2))
  );
}
function reverseDeepMerge(dest: any, ...args: any[]) {
  args.forEach((src) => {
    for (const srcArg in src) {
      if (isNil(dest[srcArg]) || isBlankString(dest[srcArg])) {
        dest[srcArg] = clone(src[srcArg]);
      } else if (objAndSameType(dest[srcArg], src[srcArg])) {
        reverseDeepMerge(dest[srcArg], src[srcArg]);
      }
    }
  });
  return dest;
}

// check a value is null or undefined
function isNil(value: any) {
  return value == null;
}

function isBlankString(value: any) {
  return value === '';
}

function getSchemaAction(schema: JSONSchema7Ext) {
  const action = [];
  if ('title' in schema) {
    action.push(v.title(schema['title']!));
  }
  if ('description' in schema) {
    action.push(v.description(schema['description']!));
  }
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

function isEmpty(v: any) {
  return v === '' || v == null;
}

function isObject(v: any) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function isConst(schema: JSONSchema7Definition) {
  return (
    typeof schema === 'object' &&
    (schema.hasOwnProperty('const') ||
      (schema.enum && schema.enum.length === 1))
  );
}

interface IOptions {
  schema: JSONSchema7Ext;
  ignoreDefault?: boolean;
  strict?: boolean;
  /** 对象中使用 */
  unionKey?: string;
}
const WrapperList = ['tooltip', 'jsonschema-label', 'validator'];
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
    let schema = clone(this.root);
    return this._toValibot(schema, { schema });
  }

  private __toValibotWrapper(
    schema: JSONSchema7Ext,
    { ...options }: IOptions,
  ) {
    if (typeof schema !== 'object' || !schema) {
      return undefined;
    }
    if (this.cacheSchema.has(schema)) {
      return this.cacheSchema.get(schema);
    }
    const result = this._toValibot(schema, { ...options });
    this.cacheSchema.set(schema, result);
    return result;
  }
  private _toValibot(
    schema: JSONSchema7Ext,
    { ...options }: IOptions,
  ): ResolvedSchema | undefined {
    schema = this.resolveSchema(schema, options);
    const actionList = getSchemaAction(schema);
    const configList: any[] = [];
    const types = this.guessSchemaType(schema);
    const type = types[0];

    if (!options.ignoreDefault && schema.readOnly) {
      configList.push(formConfig<any>({ disabled: true }));
    }
    if ('not' in schema && schema.not) {
      const notSchema = this.__toValibotWrapper(
        schema.not as JSONSchema7,
        options,
      );
      if (notSchema) {
        actionList.push(
          v.check((item) => {
            const result = v.safeParse(notSchema, item);
            return !result.success;
          }),
        );
      }
    }
    let createTypeFn = <T extends v.BaseSchema<any, any, any>>(input: T) =>
      v.pipe(input, ...actionList, ...configList);

    if (!options.ignoreDefault && 'default' in schema) {
      createTypeFn = (input) =>
        v.pipe(
          v.optional(input, schema.default) as any,
          ...actionList,
          ...configList,
        );
    } else if (types.includes('null')) {
      createTypeFn = (input) =>
        v.pipe(v.nullable(input) as any, ...actionList, ...configList);
    }
    // enum
    const maybeEnumSchema = this.#enumToDefine(schema);
    if (maybeEnumSchema) {
      actionList.push(jsonActions.setWrappers(WrapperList));
      return createTypeFn(maybeEnumSchema);
    }
    // 这个是单独类型,与type互斥
    if ('const' in schema) {
      return createTypeFn(
        v.optional(v.literal(schema.const as any), schema.const),
      );
    } else if (schema.oneOf) {
      return createTypeFn(this.logicGroupSchema(schema, 'oneOf', options));
    } else if (schema.anyOf) {
      return createTypeFn(this.logicGroupSchema(schema, 'anyOf', options));
    } else {
      switch (type) {
        case 'number':
        case 'integer': {
          actionList.push(jsonActions.setWrappers(WrapperList));
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
          let parent;

          const childrenMap = new Map<string, any>();
          const addonList: any[] = [];
          let checkUnion = false;
          const { propDeps, schemaDeps } = this.resolveDependencies(schema);
          for (const property of Object.keys(schema.properties ?? {})) {
            if (options.unionKey === property) {
              checkUnion = true;
              continue;
            }
            const isRequired =
              Array.isArray(schema.required) &&
              schema.required.indexOf(property) !== -1;
            // 子级
            const child = this.__toValibotWrapper(
              <JSONSchema7>schema.properties![property],
              { ...options, unionKey: undefined },
            );
            if (!child) {
              // todo patternProperties
              console.warn(schema.properties![property]);
              continue;
            }
            // 添加子级
            if (!isRequired && child.type !== 'optional') {
              childrenMap.set(property, v.optional(child));
            } else {
              childrenMap.set(property, child);
            }

            if (schemaDeps[property]) {
              const depSchema = schemaDeps[property];
              const haskey = this.#hasSelfKey(depSchema, property);

              const instance = this.__toValibotWrapper(depSchema, {
                ...options,
                unionKey: haskey ? property : undefined,
              });
              addonList.push(
                v.pipe(
                  instance.type === 'optional'
                    ? instance
                    : v.optional(instance),
                  hideWhen({
                    disabled: true,
                    listen: (fn, field) => {
                      const queryField = field.get(['..', 0, property])!;
                      return queryField.form.control!.valueChanges.pipe(
                        map(
                          (value) =>
                            queryField.form.control!.status$$() !== VALID ||
                            value === undefined,
                        ),
                      );
                    },
                  }),
                ),
              );
            }
          }

          for (const key of Object.keys(propDeps ?? {})) {
            const list = propDeps[key];
            let depSchema = childrenMap.get(key)!;
            depSchema = v.pipe(
              depSchema,
              formConfig({
                validators: [
                  (control) => {
                    const needRequired = list.some(
                      (item) => control.parent!.get(item)?.valid,
                    );
                    return needRequired
                      ? control.value
                        ? undefined
                        : { dependentRequired: `must required` }
                      : undefined;
                  },
                ],
              }),
            );
            childrenMap.set(key, depSchema);
          }
          // if (!childrenMap.size) {
          //   return undefined;
          // }
          const restSchema = schema.additionalProperties
            ? this.__toValibotWrapper(
                schema.additionalProperties as JSONSchema7,
                { schema: options.schema },
              )
            : undefined;
          const childrenSchemas = [...childrenMap.entries()].reduce(
            (obj, [key, value]) => {
              obj[key] = value;
              return obj;
            },
            {} as Record<any, any>,
          );
          let baseSchema;
          if ('additionalProperties' in schema) {
            if (!restSchema) {
              baseSchema = v.object(childrenSchemas);
            } else {
              baseSchema = v.objectWithRest(childrenSchemas, restSchema);
            }
          } else {
            baseSchema = v.looseObject(childrenSchemas);
          }
          if (addonList.length) {
            // 因为交叉类型问题,使用一个临时兼容
            parent = v.fallback(
              v.intersect([baseSchema, ...addonList]),
              (a) => a,
            );
          } else {
            parent = baseSchema;
          }
          if (checkUnion) {
            const constValue = this.#parseEnum(
              schema.properties![options.unionKey!] as any,
            )!.map((item) => item.value);
            parent = v.pipe(
              parent,
              hideWhen({
                disabled: true,
                listen: (fn, field) =>
                  field
                    .get(['..', '..', 0, options.unionKey!])!
                    .form.control!.valueChanges.pipe(
                      map((item) => constValue.every((cv) => cv !== item)),
                    ),
              }),
            );
          }

          return createTypeFn(v.pipe(parent, setComponent('restGroup'))) as any;
        }
        case 'array': {
          const arrayConfig = this.#getArrayConfig(schema);
          if (!arrayConfig) {
            return v.lazy(() => createTypeFn(v.array(v.any())));
          }
          actionList.push(jsonActions.setWrappers(WrapperList));
          let parent;
          const prefixItems = arrayConfig.prefixItems;
          // tuple
          if (Array.isArray(prefixItems)) {
            const items = prefixItems.map((item) =>
              this.resolveSchema(<JSONSchema7>item, options),
            );
            const tupleList = items.map((item, index) =>
              this.__toValibotWrapper(item as any, options),
            );
            if (arrayConfig.items) {
              const result = this.__toValibotWrapper(
                arrayConfig.items as any,
                options,
              );
              parent = v.tupleWithRest(tupleList, result);
            } else {
              parent = v.looseTuple(tupleList);
            }
            return createTypeFn(parent);
          }
          if ('contains' in schema) {
            const containsSchema = this.__toValibotWrapper(
              arrayConfig.items as any,
              options,
            );
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
          return v.lazy(() =>
            createTypeFn(
              v.array(
                this.__toValibotWrapper(
                  this.resolveSchema(<JSONSchema7>prefixItems, options),
                  options,
                ),
              ),
            ),
          );
        }
        default:
          throw new Error(`未知类型:${type}`);
      }
    }
    throw new Error('');
  }

  private resolveSchema(schema: JSONSchema7, options: IOptions): JSONSchema7 {
    if (schema && schema.$ref) {
      schema = this.resolveDefinition(schema, options);
    }

    if (schema && schema.allOf) {
      schema = this.resolveAllOf(schema, options);
    }

    return schema;
  }

  private resolveAllOf(
    { allOf, ...baseSchema }: JSONSchema7Ext,
    options: IOptions,
  ) {
    if (!allOf!.length) {
      throw Error(`allOf array can not be empty ${allOf}.`);
    }

    return (allOf as JSONSchema7Ext[]).reduce(
      (base: JSONSchema7Ext, schema: JSONSchema7Ext) => {
        schema = this.resolveSchema(schema, options);
        if (base.required && schema.required) {
          base.required = [...base.required, ...schema.required];
        }

        if (schema.uniqueItems) {
          base.uniqueItems = schema.uniqueItems;
        }

        // resolve to min value
        (
          [
            'maxLength',
            'maximum',
            'exclusiveMaximum',
            'maxItems',
            'maxProperties',
          ] as (keyof JSONSchema7Ext)[]
        ).forEach((prop) => {
          if (!isEmpty(base[prop]) && !isEmpty(schema[prop])) {
            (base as any)[prop] =
              base[prop]! < schema[prop]! ? base[prop] : schema[prop];
          }
        });

        // resolve to max value
        (
          [
            'minLength',
            'minimum',
            'exclusiveMinimum',
            'minItems',
            'minProperties',
          ] as (keyof JSONSchema7Ext)[]
        ).forEach((prop) => {
          if (!isEmpty(base[prop]) && !isEmpty(schema[prop])) {
            (base as any)[prop] =
              base[prop]! > schema[prop]! ? base[prop] : schema[prop];
          }
        });

        return reverseDeepMerge(base, schema);
      },
      baseSchema,
    );
  }

  private logicGroupSchema(
    schema: JSONSchema7,
    type: 'oneOf' | 'anyOf',
    options: IOptions,
  ) {
    const { oneOf, anyOf, ...restSchema } = schema;
    const children = (type === 'oneOf' ? oneOf! : anyOf!)
      .map((schema, index) => {
        const result = this.__toValibotWrapper(
          { ...(schema as JSONSchema7), ...restSchema },
          options,
        );
        return result;
      })
      .filter(Boolean);
    const baseSchema = v.pipe(
      type === 'oneOf' ? v.union(children) : v.intersect(children),
      setComponent('logic-group'),
    );
    return options.unionKey
      ? baseSchema
      : v.pipe(baseSchema, patchProps({ type }));
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
    const propDeps: { [id: string]: string[] } = {};
    const schemaDeps: { [id: string]: JSONSchema7 } = {};
    const dependentRequired = (dependency: string[], prop: string) => {
      dependency.forEach((dep) => {
        propDeps[dep] ??= [];
        propDeps[dep].push(prop);
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

    return { propDeps, schemaDeps };
  }

  private guessSchemaType(schema: JSONSchema7) {
    const type = schema?.type;
    if (!type && schema?.properties) {
      return ['object'];
    }

    if (Array.isArray(type)) {
      if (type.length === 1) {
        return type;
      }

      if (type.length === 2 && type.indexOf('null') !== -1) {
        return type.sort((t1) => (t1 == 'null' ? 1 : -1));
      }

      return type;
    }

    return type ? [type] : [];
  }

  #hasSelfKey(schema: JSONSchema7, property: string) {
    const list = schema.oneOf ?? [];
    if (!list.length) {
      return false;
    }
    return list.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        item['properties'] &&
        property in item['properties'],
    );
  }
  #getArrayConfig(schema: JSONSchema7) {
    if ('prefixItems' in schema) {
      return {
        prefixItems: schema.prefixItems as
          | JSONSchema7Definition
          | JSONSchema7Definition[],
        items: schema.items as JSONSchema7Definition | undefined,
      };
    } else if ('items' in schema) {
      return {
        prefixItems: schema.items as
          | JSONSchema7Definition
          | JSONSchema7Definition[],
        items: schema.additionalItems,
      };
    }
    return undefined;
  }
  #enumToDefine(schema: JSONSchema7) {
    const enumOptions = this.#parseEnum(schema);
    if (!enumOptions) {
      return;
    }
    const baseSchema = v.picklist(enumOptions.map((item) => item.value));
    if (schema.type === 'array') {
      return v.pipe(
        v.array(baseSchema),
        asControl(),
        setComponent('multiselect'),
        patchInputs({
          options: enumOptions,
        }),
      );
    } else {
      return v.pipe(
        baseSchema,
        patchInputs({
          options: enumOptions,
        }),
      );
    }
  }
  #parseEnum(
    schema: JSONSchema7,
    level: number = 0,
  ): { value: any; label: any }[] | undefined {
    if ('enum' in schema) {
      return schema.enum!.map((value) => ({ value, label: value }));
    } else {
      const toEnum = (s: JSONSchema7) => {
        const value = 'const' in s ? s.const : s.enum![0];
        const option: any = { value, label: s.title || value };
        if (s.readOnly) {
          option.disabled = true;
        }

        return option;
      };
      if (!!schema.anyOf && (schema.anyOf as JSONSchema7[]).every(isConst)) {
        return (schema.anyOf as JSONSchema7[]).map(toEnum);
      } else if (
        !!schema.oneOf &&
        (schema.oneOf as JSONSchema7[]).every(isConst)
      ) {
        return (schema.oneOf as JSONSchema7[]).map(toEnum);
      } else if (schema.uniqueItems) {
        const arrayConfig = this.#getArrayConfig(schema);
        if (
          !level &&
          !!arrayConfig &&
          !Array.isArray(arrayConfig.prefixItems)
        ) {
          return this.#parseEnum(schema.items as any, 1);
        }
      }
    }
    return undefined;
  }
}
