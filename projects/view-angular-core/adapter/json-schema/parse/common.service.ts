import {
  JsonSchemaDraft202012Object,
  JsonSchemaDraft202012,
} from '@hyperjump/json-schema/draft-2020-12';
import {
  difference,
  intersection,
  isBoolean,
  isNil,
  isString,
  isUndefined,
  union,
} from 'es-toolkit';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { createImpasseAction } from '../../util/validation';
import {
  BaseAction,
  JSONSchemaRaw,
  ResolvedJsonSchema,
  ResolvedSchema,
} from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
import { schema as cSchema } from '@piying/valibot-visit';
import * as jsonActions from '@piying/view-angular-core';
import { getBooleanDefine } from '../../util/define';
import { clone } from '../../util/clone';
import { toFixedList } from '../../util/to-fixed-list';
function arrayIntersection(a: any, b: any) {
  if (!isNil(a) && !isNil(b)) {
    a = Array.isArray(a) ? a : [a];
    b = Array.isArray(b) ? b : [b];
    if (a.length && b.length) {
      const result = intersection(a, b);
      if (result.length === 0) {
        return {
          action: createImpasseAction('applicator'),
          value: undefined,
        };
      } else {
        return { value: result };
      }
    }
    return {
      value: a.length ? a : b,
    };
  }
  return { value: a ?? b };
}
function getMetadataAction(schema: JSONSchemaRaw) {
  const action = [];
  if (isString(schema.title)) {
    action.push(v.title(schema.title));
  }
  if (isString(schema.description)) {
    action.push(v.description(schema.description));
  }
  return action;
}

export class CommonTypeService extends BaseTypeService {
  override readonly name: any = 'common';

  override parse(actionList: BaseAction[]): ResolvedSchema {
    return this.jSchemaToVSchema2(this.schema);
  }
  jSchemaToVSchema2(input: JsonSchemaDraft202012): ResolvedSchema {
    if (isBoolean(input)) {
      return getBooleanDefine(input);
    }
    if (this.instance.cacheSchema.has(input)) {
      return this.instance.cacheSchema.get(input);
    }
    const schema = this.resolveSchema2(input);
    this.schema = schema;
    const actionList = this.#applicatorNot(schema);
    const result = actionList.length
      ? v.pipe(this.#applicatorParse(schema), ...actionList)
      : this.#applicatorParse(schema);
    this.instance.cacheSchema.set(input, result);
    return result;
  }
  #applicatorNot(schema: ResolvedJsonSchema) {
    const actionList = [];
    if (isBoolean(schema.not)) {
      if (schema.not) {
        actionList.push(createImpasseAction('not', schema.not));
      }
    } else if (schema.not) {
      const vSchema = this.#jsonSchemaBase(
        this.resolveSchema2(schema.not),
        () => [],
      );
      actionList.push(
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          const result = v.safeParse(vSchema, dataset.value);
          if (result.success) {
            addIssue({ label: `applicator:not` });
          }
        }),
      );
    }
    return actionList;
  }

  #jsonSchemaBase(
    schema: ResolvedJsonSchema,
    getValidationActionList: () => BaseAction[],
  ) {
    const types = schema.__resolved.type;
    // 暂时为只支持一个
    const type = types.types[0];
    const actionList: BaseAction[] = getMetadataAction(schema);

    switch (type as any) {
      case 'picklist': {
        return this.typeParse(
          '__fixedList',
          {
            type: '__fixedList',
            data: { options: [toFixedList(schema.enum!)], multi: false },
          } as any,
          [...getValidationActionList(), ...actionList],
        );
      }
      case 'const':
      case '__fixedList':
      case 'object':
      case 'null':
      case 'string':
      case 'boolean':
      case 'integer':
      case 'number': {
        return this.typeParse(type, schema, [
          ...getValidationActionList(),
          ...actionList,
        ]);
      }
      case 'array': {
        if (schema.items && !isBoolean(schema.items)) {
          const result = this.getOptions([this.resolveSchema2(schema)]);
          if (result) {
            return this.typeParse(
              '__fixedList',
              { type: '__fixedList', data: result } as any,
              [...getValidationActionList(), ...actionList],
            );
          }
        }
        return this.typeParse(type, schema, [
          ...getValidationActionList(),
          ...actionList,
        ]);
      }
      default:
        throw new Error(`未知类型:${type}`);
    }
  }
  #applicatorParse(schema: ResolvedJsonSchema) {
    let vSchema;
    if (schema.allOf) {
      const result = this.#mergeSchema(schema, ...schema.allOf);
      vSchema = v.pipe(
        this.#jsonSchemaBase(result.schema, () => result.actionList)!,
      );
    } else if (schema.anyOf) {
      vSchema = this.#conditionCreate(schema, {
        useOr: false,
        getChildren: () => schema.anyOf!,
        conditionCheckActionFn(childOriginSchemaList, getActivateList) {
          return v.rawCheck(({ dataset, addIssue }) => {
            if (dataset.issues) {
              return;
            }
            let childFailedResult:
              | { index: number; issues?: any[] }
              | undefined;
            // 验证项全为可选,所以需要这里再次验证
            const hasSuccess = childOriginSchemaList.some((item, index) => {
              const isActive = getActivateList()[index];
              if (!isActive) {
                childFailedResult ??= { index: index };
                return false;
              }
              const result = v.safeParse(item, dataset.value);
              if (!result.success) {
                childFailedResult = { index: index, issues: result.issues };
              }
              return result.success;
            });
            if (!hasSuccess) {
              const extMessage =
                childFailedResult?.issues
                  ?.map((item) => item.message)
                  .join(',') ?? '';
              addIssue({
                label: `anyOf:${childFailedResult?.index ?? ''}:${extMessage}`,
              });
            }
          });
        },
        conditionSchemaFn: (baseSchema, conditionVSchema, childSchemaList) =>
          v.pipe(
            v.intersect([
              conditionVSchema,
              baseSchema,
              v.pipe(
                cSchema.intersect(
                  childSchemaList.map((item) =>
                    v.pipe(
                      v.optional(item),
                      jsonActions.renderConfig({ hidden: true }),
                    ),
                  ),
                ),
                jsonActions.setAlias(
                  `${this.instanceNamePrefix$$()}-cond-display`,
                ),
              ),
            ]),
            jsonActions.setComponent('anyOf-condition'),
          ),
      });
    } else if (schema.oneOf) {
      vSchema = this.#conditionCreate(schema, {
        useOr: true,
        getChildren() {
          return schema.oneOf!;
        },
        conditionCheckActionFn(childOriginSchemaList, getActivateList) {
          return v.rawCheck(({ dataset, addIssue }) => {
            if (dataset.issues) {
              return;
            }
            // 验证项全为可选,所以需要这里再次验证
            const hasSuccess = childOriginSchemaList.filter((item, index) => {
              const isActive = getActivateList()[index];
              if (!isActive) {
                return false;
              }
              const result = v.safeParse(item, dataset.value);
              return result.success;
            });
            if (hasSuccess.length !== 1) {
              addIssue({
                label: `oneOf`,
                expected: '1📏',
                received: `${hasSuccess.length}📏`,
              });
            }
          });
        },
        conditionSchemaFn(baseSchema, conditionVSchema, childSchemaList) {
          return v.pipe(
            cSchema.intersect([
              conditionVSchema,
              baseSchema,
              v.union(
                childSchemaList.map((item) =>
                  v.pipe(item, jsonActions.renderConfig({ hidden: true })),
                ),
              ),
            ]),
            jsonActions.setComponent('oneOf-condition'),
          );
        },
      });
    } else if ('if' in schema) {
      /**
       * 当前设计中if/then/else是采用的分离显示
       * 也就是then/else都会合并base,然后按条件展示,
       */

      const useThen$ = new BehaviorSubject<boolean | undefined>(undefined);
      const baseSchema = v.pipe(
        this.#jsonSchemaBase(schema, () => [
          ...this.getValidationActionList(schema),
          jsonActions.hideWhen({
            disabled: false,
            listen: (fn) =>
              fn({}).pipe(
                map(({ list: [value], field }) => {
                  const isThen = isBoolean(schema.if)
                    ? schema.if
                    : v.safeParse(ifVSchema, value).success;
                  (
                    field.form.parent as jsonActions.FieldLogicGroup
                  ).activateIndex$.set(isThen ? 1 : 2);
                  useThen$.next(isThen);
                  return !((isThen && !thenSchema) || (!isThen && !elseSchema));
                }),
              ),
          }),
        ]),
      );
      /** 仅为验证项,非显示用 */
      let ifVSchema: ResolvedSchema;
      if (isBoolean(schema.if)) {
        ifVSchema = v.literal(schema.if);
      } else {
        const ifSchema = this.#mergeSchema(schema, schema.if!);
        ifVSchema = v.pipe(
          this.#jsonSchemaBase(ifSchema.schema, () => ifSchema.actionList)!,
        );
      }
      function hideAction(isThen: boolean) {
        return [
          jsonActions.renderConfig({ hidden: true }),
          jsonActions.hideWhen({
            disabled: true,
            listen(fn) {
              return fn({ list: [['..', 0]] }).pipe(
                switchMap(({ list: [] }) => useThen$),
                map((a) => (a === undefined ? true : isThen ? !a : a)),
              );
            },
          }),
        ];
      }
      let thenSchema: ResolvedSchema | undefined;
      if (schema.then && !isBoolean(schema.then)) {
        const subSchema = this.#mergeSchema(schema, schema.then!);
        thenSchema = v.pipe(
          this.#jsonSchemaBase(subSchema.schema, () => [
            ...subSchema.actionList,
            ...hideAction(true),
          ]),
        );
      }

      let elseSchema: ResolvedSchema | undefined;
      if (schema.else && !isBoolean(schema.else)) {
        const subSchema = this.#mergeSchema(schema, schema.else);
        elseSchema = v.pipe(
          this.#jsonSchemaBase(subSchema.schema, () => [
            ...subSchema.actionList,
            ...hideAction(false),
          ]),
        );
      }

      // 这种逻辑没问题,因为jsonschema验证中,也会出现base和子级架构一起验证
      vSchema = v.pipe(
        v.union(
          [
            baseSchema,
            thenSchema ?? baseSchema,
            elseSchema ?? baseSchema,
          ].filter(Boolean),
        ),
        jsonActions.formConfig({ disableOrUpdateActivate: true }),
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          const status = useThen$.value;
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
    } else {
      vSchema = v.pipe(
        // 通用部分
        this.#jsonSchemaBase(this.resolveSchema2(schema), () =>
          this.getValidationActionList(schema),
        ),
      );
    }
    return (
      this.instance.options?.schemaHandle?.afterResolve?.(vSchema, schema) ??
      vSchema
    );
  }

  #mergeSchema(schema: ResolvedJsonSchema, ...list: JsonSchemaDraft202012[]) {
    let base = clone(schema);
    let baseKeyList = Object.keys(base);
    const actionList = this.getValidationActionList(base) as BaseAction[];
    for (const rawChildSchema of list.filter(
      (item) => !isBoolean(item),
    ) as any as JsonSchemaDraft202012Object[]) {
      const childSchema = this.resolveSchema2(rawChildSchema);
      actionList.push(...this.getValidationActionList(childSchema));
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
            // todo 此属性false在当前使用,子级会验证失败,
            // 附加属性
            childSchema.additionalProperties ??= base.additionalProperties;

            break;
          }
          case 'contains': {
            if (childSchema[key] === false || base[key] === false) {
              actionList.push(createImpasseAction('contains', false));
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
          case 'required': {
            childSchema.required = union(
              childSchema.required ?? [],
              base.required ?? [],
            );
            break;
          }
          default:
            (childSchema as any)[key] ??= (base as any)[key];
            break;
        }
      }

      base = childSchema as any;
    }
    return { schema: base, actionList };
  }

  #conditionCreate(
    schema: ResolvedJsonSchema,
    options: {
      getChildren: () => JsonSchemaDraft202012[];
      conditionSchemaFn: (
        baseSchema: ResolvedSchema,
        conditionVSchema: ResolvedSchema,
        childSchemaList: ResolvedSchema[],
      ) => ResolvedSchema;
      conditionCheckActionFn: (
        childOriginSchemaList: ResolvedSchema[],
        getActivateList: () => boolean[],
      ) => v.BaseValidation<any, any, any>;
      useOr: boolean;
    },
  ) {
    const fixedKeyList = Object.keys(this.getFixedChild());
    const resolvedChildList = options
      .getChildren()!
      .map((item) => this.#mergeSchema(schema, item));
    const resolvedChildJSchemaList = resolvedChildList.map(
      (item) => item.schema,
    );
    const isObject = [schema, ...resolvedChildJSchemaList].every((item) =>
      item.__resolved.type.types.includes('object'),
    );
    /** 通用子级验证部分,不显示  */
    const childOriginSchemaList = resolvedChildList.map((item) =>
      v.pipe(this.#jsonSchemaBase(item.schema, () => item.actionList)),
    );
    let activateList: boolean[] = [];

    const conditionCheckAction = options.conditionCheckActionFn(
      childOriginSchemaList,
      () => activateList,
    );
    // 仅处理object,实现条件显示
    if (isObject) {
      const conditionResult = this.#schemaExtract(
        schema,
        ...resolvedChildJSchemaList,
      );

      if (conditionResult) {
        const conditionKeyList = conditionResult.conditionKeyList;
        const excludeFixedConditionList = difference(
          conditionResult.conditionKeyList,
          fixedKeyList,
        );
        /** 子级的共同部分验证,用于检测是哪个子级,不显示 */
        const childConditionVSchemaList =
          conditionResult.childConditionJSchemaList.map((schema) => {
            const rSchema = this.resolveSchema2(schema);
            return v.pipe(
              this.#jsonSchemaBase(rSchema, () =>
                this.getValidationActionList(rSchema),
              ),
            );
          });
        if (fixedKeyList.length) {
          for (const key of fixedKeyList) {
            delete conditionResult.conditionJSchema.properties?.[key];
            conditionResult.childConditionJSchemaList.forEach((schema) => {
              delete schema.properties?.[key];
            });
          }
          conditionResult.conditionKeyList = excludeFixedConditionList;
        }
        const checkAction = jsonActions.patchHooks({
          allFieldsResolved: (field) => {
            const displayName = ['..', 2];
            const list = [];
            const currenConditionSchema = field;
            list.push(currenConditionSchema.form.control!.valueChanges);
            if (fixedKeyList.length) {
              list.push(
                combineLatest(
                  fixedKeyList.map((key) => {
                    const instanceNamePrefix = this.getFixedChildBy(key);

                    return field.get([
                      '#',
                      `@${instanceNamePrefix}-fixed`,
                      key,
                    ])!.form.control!.valueChanges;
                  }),
                ).pipe(
                  map((list) =>
                    list.reduce((obj, cur, i) => {
                      obj[fixedKeyList[i]] = cur;
                      return obj;
                    }, {} as any),
                  ),
                ),
              );
            }
            combineLatest(list)
              .pipe(
                map((list) =>
                  list.reduce((obj, cur) => {
                    obj = { ...obj, ...cur };
                    return obj;
                  }, {} as any),
                ),
              )
              .subscribe((value) => {
                activateList.length = 0;
                const conditionDisplay = field.get([...displayName])!.form
                  .control as any as jsonActions.FieldLogicGroup;
                const parentAList = [];

                for (
                  let index = 0;
                  index < childConditionVSchemaList.length;
                  index++
                ) {
                  const schema = childConditionVSchemaList[index];
                  const result = v.safeParse(schema, value);
                  activateList.push(result.success);
                  // todo key需要查询
                  field
                    .get([...displayName, index])
                    ?.renderConfig.update((data) => ({
                      ...data,
                      hidden: !result.success,
                    }));
                  if (result.success) {
                    parentAList.push(conditionDisplay!.children$$!()[index]);
                  }
                }
                if (!options.useOr) {
                  conditionDisplay.activateControls$.set(parentAList);
                }
              });
          },
        });

        // todo 修改支持父级监听

        // todo 主条件要过滤
        /** 主条件部分,用于显示切换 */
        const conditionVSchema = v.pipe(
          this.#jsonSchemaBase(
            this.resolveSchema2(conditionResult.conditionJSchema),
            () => [],
          ),
          checkAction,
        );
        conditionKeyList.forEach((key) => {
          resolvedChildJSchemaList.forEach((item) => {
            delete item.properties![key];
          });
          delete schema.properties?.[key];
        });

        const baseSchema = v.pipe(
          this.#jsonSchemaBase(schema, () =>
            this.getValidationActionList(schema),
          ),
        );
        // todo 解析条件也要过滤
        const childVSchemaList = resolvedChildJSchemaList.map((item) =>
          // 验证部分被单独提取出来
          v.pipe(this.#jsonSchemaBase(item, () => [])),
        );

        return v.pipe(
          options.conditionSchemaFn(
            baseSchema,
            v.pipe(
              conditionVSchema,
              jsonActions.setAlias(`${this.instanceNamePrefix$$()}-cond`),
            ),

            childVSchemaList,
          ),
          conditionCheckAction,
        );
      } else {
        activateList = childOriginSchemaList.map((_, i) => true);
        return v.pipe(
          options.useOr
            ? v.union(childOriginSchemaList)
            : cSchema.intersect(
                childOriginSchemaList.map((item) => v.optional(item)),
              ),
          ...getMetadataAction(schema),
          conditionCheckAction,
          jsonActions.setComponent(
            `${options.useOr ? 'oneOf' : 'anyOf'}-select`,
          ),
        );
      }
    }

    const result = this.getOptions(resolvedChildJSchemaList);
    if (result) {
      const instance = this.getTypeParse('__fixedList', {
        data: result,
        type: '__fixedList',
      } as any);
      activateList = childOriginSchemaList.map((_, i) => true);
      return instance.parse([
        ...getMetadataAction(schema),
        conditionCheckAction,
      ]);
    }
    const baseSchema = v.pipe(
      this.#jsonSchemaBase(schema, () => this.getValidationActionList(schema)),
    );
    activateList = childOriginSchemaList.map((_, i) => true);
    return v.pipe(baseSchema, conditionCheckAction);
  }
  getOptions(childList: ResolvedJsonSchema[]) {
    if (!childList.length) {
      return;
    }
    const fn2 = () => {
      const data = {
        multi: undefined as boolean | undefined,
        uniqueItems: true,
      };
      const fn = (
        schema: ResolvedJsonSchema,
      ): { value: any; label: any }[] | undefined => {
        let options;
        let multi2 = false;
        if (!isUndefined(schema.const)) {
          options = [
            { value: schema.const, label: schema.title ?? schema.const },
          ];
        } else if (schema.enum) {
          if (schema.enum.length === 1) {
            options = [
              {
                value: schema.enum[0],
                label: schema.title ?? schema.enum[0],
              },
            ];
          }
          options = schema.enum.map((item) => ({ label: item, value: item }));
        } else if (schema.items && !isBoolean(schema.items)) {
          const items = this.resolveSchema2(schema.items);
          options = fn2().fn(items);
          multi2 = true;
          data.uniqueItems &&= !!schema.uniqueItems;
        }
        if (!options) {
          return undefined;
        }
        if (data.multi === undefined) {
          data.multi = multi2;
        } else if (data.multi !== multi2) {
          throw new Error(`options multi conflict`);
        }
        return options!;
      };
      return {
        fn,
        getData: () => data,
      };
    };

    const list = [];
    const fn$ = fn2();
    for (const schema of childList) {
      const item = fn$.fn(schema);
      if (!item) {
        return undefined;
      }
      list.push(item);
    }
    const data = fn$.getData();
    return {
      uniqueItems: data.uniqueItems,
      multi: data.multi!,
      options: list,
    };
  }

  #schemaExtract(
    schema: ResolvedJsonSchema,
    ...childList: ResolvedJsonSchema[]
  ) {
    const childKeyList = childList.reduce(
      (cur, item) => {
        if (cur && !cur.length) {
          return cur;
        }
        const keyList = Object.keys(item.properties ?? {}).filter((key) => {
          const propItem = item.properties![key]!;
          if (isBoolean(propItem)) {
            return false;
          }
          const resolved = this.resolveSchema2(propItem);
          return !resolved.__resolved.type.types.includes('object');
        });
        if (!cur) {
          return keyList;
        } else {
          return intersection(cur, keyList);
        }
      },
      undefined as string[] | undefined,
    )!;

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
      const optionsResult = this.getOptions(
        childList.map((item) =>
          this.resolveSchema2(item.properties![key] as any),
        ),
      );
      if (optionsResult) {
        conditionKeyList.push(key);
        conditionJSchema.properties![key] = {
          type: '__fixedList',
          data: optionsResult,
        } as any;
        childConditionJSchemaList.forEach((item, i) => {
          item.properties![key] = childList[i].properties![key];
        });
      } else {
        conditionKeyList.push(key);
        conditionJSchema.properties![key] = {
          type: this.resolveSchema2(childList[0].properties![key]! as any)
            .__resolved.type.types[0],
        };
        childConditionJSchemaList.forEach((item, i) => {
          item.properties![key] = childList[i].properties![key];
        });
      }
    }
    return { conditionJSchema, childConditionJSchemaList, conditionKeyList };
  }
}
