import { map, merge } from 'rxjs';
import { BaseAction, OptionJSType, ResolvedSchema } from '../type';
import { BaseTypeService, ChildKind } from './base.service';
import * as v from 'valibot';
import { isBoolean } from 'es-toolkit';
import * as jsonActions from '@piying/view-angular-core';
import { schema as cSchema } from '@piying/valibot-visit';
import { hideWhen } from '@piying/view-angular-core';
import { createImpasseAction } from '../../util/validation';

export class ObjectTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'object';
  actionList: BaseAction[] = [];
  #optional = false;
  childObject = {};
  fixedActionList = [];
  // fixedObjName!: string;
  override isOptional(): boolean {
    return super.isOptional() || this.#optional;
  }
  override getExtraActionList(): BaseAction[] {
    return this.actionList;
  }
  getFixedChildPath(key: string) {
    if (key in this.childObject) {
      return this.instanceNamePrefix$$();
    }
    return undefined;
  }
  override getBaseDefine() {
    const fixedObjName = `${this.instanceNamePrefix$$()}-fixed`;
    const actionList = this.actionList;
    const schema = this.schema;
    const childObject: Record<string, ResolvedSchema> = {};
    this.childObject = childObject;
    /** 附加 */
    let defaultRest: ResolvedSchema | undefined;

    let mode = 'default';

    if (schema.dependentRequired) {
      actionList.push(
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          Object.keys(schema.dependentRequired!).forEach((key) => {
            if ((dataset.value as any)?.[key] !== undefined) {
              for (const reqKey of schema.dependentRequired![key]) {
                if ((dataset.value as any)[reqKey] === undefined) {
                  addIssue({
                    label: `dependentRequired:${key}=>${reqKey}`,
                    expected: '[required]',
                    received: 'undefined',
                  });
                }
              }
            }
          });
        }),
      );
    }
    let hasRequiredKey = false;
    // 普通属性
    if (schema.properties) {
      for (const key in schema.properties) {
        const propJSchema = schema.properties[key];
        let propData;
        if (isBoolean(propJSchema)) {
          propData = { optional: false, hasRef: false };
        } else {
          const rSchema = this.resolveSchema2(propJSchema);
          propData = {
            optional: rSchema.__resolved.type.optional,
            hasRef: rSchema.__resolved.hasRef,
          };
        }

        const isRequired = !!schema.required?.includes(key);
        const wrapperOptional = !isRequired && !propData.optional;
        if (isRequired && !propData.optional) {
          hasRequiredKey = true;
        }
        const createRef = () => {
          let propVSchema = this.commonTypeParse(propJSchema, {
            kind: ChildKind.child,
          });
          const depList = schema.dependentRequired?.[key];
          if (depList) {
            propVSchema = v.pipe(
              propVSchema,
              jsonActions.mergeHooks({
                allFieldsResolved: (field) => {
                  field.form.control!.statusChanges.subscribe(() => {
                    const valid = field.form.control!.valid;
                    depList.map((item) => {
                      field.form.parent.get(item)?.config$.update((config) => ({
                        ...config,
                        required: valid,
                      }));
                    });
                  });
                },
              }),
            );
          }
          return propVSchema;
        };
        childObject[key] = propData.hasRef
          ? wrapperOptional
            ? v.optional(v.lazy(() => createRef()))
            : v.lazy(() => createRef())
          : wrapperOptional
            ? v.optional(createRef())
            : createRef();
      }
    }
    // 附加属性规则
    if (isBoolean(schema.additionalProperties)) {
      mode = schema.additionalProperties === false ? 'strict' : mode;
    } else if (schema.additionalProperties) {
      mode = 'rest';
      // rest要符合的规则
      defaultRest = this.commonTypeParse(schema.additionalProperties!, {
        kind: ChildKind.condition,
      });
    }
    const patternRestList = [] as {
      regexp: RegExp;
      schema: ResolvedSchema;
    }[];
    if (schema.patternProperties) {
      for (const key in schema.patternProperties) {
        const item = this.commonTypeParse(schema.patternProperties[key], {
          kind: ChildKind.condition,
        });
        if (!item) {
          throw new Error(`patternProperties->${key}: 定义未找到`);
        }
        patternRestList.push({
          regexp: new RegExp(key),
          schema: item,
        });
      }
    }
    /** 条件显示 */
    const conditionList = [];
    if (schema.dependentSchemas) {
      const depSchemaMap = {} as Record<string, ResolvedSchema>;
      for (const key in schema.dependentSchemas) {
        const jSchema = schema.dependentSchemas[key];

        let vSchema = this.commonTypeParse(jSchema, {
          kind: ChildKind.condition,
        });
        if (!vSchema) {
          throw new Error(`依赖->${key}: 定义未找到`);
        }
        depSchemaMap[key] = vSchema;

        vSchema = v.pipe(
          vSchema,
          jsonActions.renderConfig({ hidden: true }),
          hideWhen({
            disabled: true,
            listen: (fn, field) => {
              const controlField = field.get(['..', '..', 0, key])!.form
                .control!;
              return merge(
                controlField.valueChanges,
                controlField.statusChanges,
              ).pipe(
                map(
                  () =>
                    !(controlField.valid && controlField.value !== undefined),
                ),
              );
            },
          }),
        );
        conditionList.push(vSchema);
      }
      actionList.push(
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          Object.keys(schema.dependentSchemas!).forEach((key) => {
            if ((dataset.value as any)?.[key] !== undefined) {
              const result = v.safeParse(depSchemaMap[key], dataset.value);
              if (!result.success) {
                for (const item of result.issues) {
                  addIssue({
                    label: `dependentSchemas:${key}`,
                    issues: item,
                  } as any);
                }
              }
            }
          });
        }),
      );
    }
    if (isBoolean(schema.propertyNames) && !schema.propertyNames) {
      actionList.push(createImpasseAction('propertyNames', 'false'));
    } else if (schema.propertyNames) {
      const propNameSchema = this.commonTypeParse(schema.propertyNames)!;
      actionList.push(
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues) {
            return;
          }
          if (dataset.value && typeof dataset.value === 'object') {
            for (const key of Object.keys(dataset.value)) {
              const result = v.safeParse(propNameSchema, key);
              if (!result.success) {
                addIssue({
                  label: `propertyNames:${key}`,
                  expected: `[match]`,
                  received: key,
                });
              }
            }
          }
        }),
      );
    }
    let schemaDefine;
    if (!Object.keys(childObject).length || !hasRequiredKey) {
      this.#optional = true;
    }
    if (mode === 'default') {
      if (conditionList.length) {
        schemaDefine = cSchema.intersect([
          v.pipe(
            v.looseObject(childObject),
            jsonActions.setAlias(fixedObjName),
          ),
          v.optional(v.intersect(conditionList)),
        ]);
      } else {
        schemaDefine = v.pipe(
          v.looseObject(childObject),
          jsonActions.setAlias(fixedObjName),
        );
      }
    } else if (mode === 'strict') {
      if (conditionList.length) {
        schemaDefine = v.pipe(
          cSchema.intersect([
            v.pipe(v.object(childObject), jsonActions.setAlias(fixedObjName)),
            v.optional(v.intersect(conditionList)),
          ]),
        );
      } else {
        schemaDefine = v.pipe(
          v.object(childObject),
          jsonActions.setAlias(fixedObjName),
        );
      }
    } else {
      // rest
      let restDefine = v.any() as NonNullable<ResolvedSchema>;
      //propCheck patternMapRest addonRest
      if (defaultRest && !patternRestList.length) {
        restDefine = defaultRest;
      } else {
        restDefine = v.any();
      }

      if (conditionList.length) {
        schemaDefine = v.intersect([
          v.pipe(
            v.objectWithRest(childObject, restDefine),
            jsonActions.setAlias(fixedObjName),
          ),
          v.optional(v.intersect(conditionList)),
        ]);
      } else {
        schemaDefine = v.pipe(
          v.objectWithRest(childObject, restDefine),
          jsonActions.setAlias(fixedObjName),
        );
      }
    }
    if (schema.patternProperties && schema.additionalProperties) {
      actionList.push(
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.issues || dataset.value === undefined) {
            return;
          }

          if (typeof dataset.value === 'object') {
            datasetLoop: for (const key in dataset.value) {
              if (key in childObject) {
                continue;
              }
              for (const { regexp, schema } of patternRestList) {
                const isMatch = regexp.test(key);
                if (!isMatch) {
                  continue;
                }
                const result = v.safeParse(schema, (dataset.value as any)[key]);
                if (!result.success) {
                  addIssue();
                }
                continue datasetLoop;
              }
              if (defaultRest) {
                const result = v.safeParse(
                  defaultRest,
                  (dataset.value as any)[key],
                );
                if (!result.success) {
                  addIssue();
                }
              }
            }
          }
        }),
      );
    }
    return schemaDefine as ResolvedSchema;
  }
}
