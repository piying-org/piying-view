import { JsonSchemaToValibot } from '../json-schema.service';
import {
  BaseAction,
  OptionJSType,
  ResolvedJsonSchema,
  ResolvedSchema,
} from '../type';
import { isBoolean, isString, uniq } from 'es-toolkit';
import * as v from 'valibot';
import { isNumber } from '../../util/is-number';
import * as jsonActions from '@piying/view-angular-core';
import {
  JsonSchemaDraft202012,
  JsonSchemaDraft202012Object,
} from '@hyperjump/json-schema/draft-2020-12';
import { ObjectTypeService } from './object.service';
import { computed } from '@angular/core';
export const enum ChildKind {
  child,
  condition,
}
export class TypeContext {
  parent?: TypeContext;
  parentObject?: TypeContext;
  level = 0;
  instance?: BaseTypeService;
}
export interface ParseOptions {
  kind?: ChildKind;
}
export class BaseTypeService {
  static index = 0;
  context = new TypeContext();
  parent?: BaseTypeService;
  instance;
  schema;
  name!: OptionJSType | '__fixedList';
  index = 0;
  instanceNamePrefix$$ = computed(() => `${this.index}-type`);
  constructor(instance: JsonSchemaToValibot, schema: ResolvedJsonSchema) {
    this.context.instance = this;
    this.instance = instance;
    this.schema = schema;
  }
  getAllActionList(actionList: BaseAction[]) {
    return [...actionList, ...this.getExtraActionList()];
  }
  isOptional() {
    return this.schema.__resolved.type.optional;
  }
  parseBase(actionList: BaseAction[]): ResolvedSchema {
    const Define = v.pipe(
      this.getBaseDefine(),
      ...this.getAllActionList(actionList),
    );
    const OptDefine = this.isOptional()
      ? v.optional(Define, this.schema.default)
      : Define;
    return OptDefine;
  }
  parse(actionList: BaseAction[]): ResolvedSchema {
    const OptDefine = this.parseBase(actionList);
    return (
      this.instance.options?.schemaHandle?.type?.afterResolve(
        OptDefine,
        this.schema,
        this.name as any,
      ) ?? OptDefine
    );
  }

  getBaseDefine(): ResolvedSchema {
    throw new Error('');
  }

  getValidationActionList(schema: ResolvedJsonSchema) {
    const action = [];

    // string/array
    if (isNumber(schema.minLength) || isNumber(schema.minItems)) {
      action.push(v.minLength(schema.minLength ?? schema.minItems!));
    }
    // string/array
    if (isNumber(schema.maxLength) || isNumber(schema.maxItems)) {
      action.push(v.maxLength(schema.maxLength ?? schema.maxItems!));
    }

    // string
    if (isString(schema.pattern)) {
      action.push(v.regex(new RegExp(schema.pattern)));
    }
    // todo format https://json-schema.org/understanding-json-schema/reference/type#built-in-formats
    // duration idn-email idn-hostname uri-reference iri iri-reference uri-template json-pointer regex
    if (schema.format) {
      switch (schema.format) {
        // case 'date-time': {
        //   action.push(v.isoDateTime());
        //   break;
        // }
        // case 'time': {
        //   action.push(v.isoTime());
        //   break;
        // }
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
    if (isNumber(schema.exclusiveMinimum)) {
      action.push(v.gtValue(schema.exclusiveMinimum!));
    }
    if (isNumber(schema.exclusiveMaximum)) {
      action.push(v.ltValue(schema.exclusiveMaximum));
    }
    if (isNumber(schema.minimum)) {
      action.push(v.minValue(schema.minimum));
    }
    if (isNumber(schema.maximum)) {
      action.push(v.maxValue(schema.maximum));
    }

    // number
    if (isNumber(schema.multipleOf)) {
      action.push(v.multipleOf(schema.multipleOf));
    }

    // array
    if (schema.uniqueItems) {
      action.push(
        v.check((input: any[]) => uniq(input).length === input.length),
      );
    }
    // object
    if (isNumber(schema.maxProperties)) {
      action.push(v.maxEntries(schema.maxProperties));
    }
    // object
    if (isNumber(schema.minProperties)) {
      action.push(v.minEntries(schema.minProperties));
    }
    if (schema.actions) {
      for (const rawAction of schema.actions!) {
        const inlineActions =
          (jsonActions as any)[rawAction.name] ??
          this.instance.options?.customActions?.[rawAction.name];
        if (!inlineActions) {
          throw new Error(`action:[${rawAction.name}]❗`);
        }
        action.push(inlineActions(...rawAction.params));
      }
    }
    return action;
  }

  getExtraActionList(): BaseAction[] {
    return [];
  }
  typeParse(
    type: string,
    schema: ResolvedJsonSchema,
    actionList: BaseAction[],
    options?: ParseOptions,
  ) {
    const instance = this.getTypeParse(type, schema, options);
    return instance.parse(actionList);
  }
  getTypeParse(
    type: string,
    schema: ResolvedJsonSchema,
    options?: ParseOptions,
  ) {
    const Parser = this.instance.getTypeParser(type);
    const instance = new Parser(this.instance, schema);
    instance.index = ++BaseTypeService.index;
    instance.context.parent = this.context;
    if (instance.context.level) {
      instance.context.parentObject = this.context.parentObject;
    }
    if (options?.kind === ChildKind.child) {
      if (instance.context.level === 0) {
        instance.context.parentObject = instance.context;
      }
    } else if (options?.kind === ChildKind.condition) {
      instance.context.level++;
      instance.context.parentObject = this.context.parentObject ?? this.context;
    }
    return instance;
  }
  commonTypeParse(schema: JsonSchemaDraft202012, options?: ParseOptions) {
    // const resolved = this.resolveSchema2(schema as any);
    return this.typeParse('common', schema as any, [], options);
  }
  resolveSchema2(schema: JsonSchemaDraft202012Object) {
    return this.instance.resolveSchema2(schema);
  }

  schemahasRef(schema: JsonSchemaDraft202012) {
    if (isBoolean(schema)) {
      return false;
    } else {
      const result = this.resolveSchema2(schema);
      return result.__resolved.hasRef;
    }
  }

  getFixedChild() {
    let context: TypeContext | undefined = this.context;
    let childObject = {};
    while (context?.level) {
      context = context.parentObject;
      const instance = context?.instance as ObjectTypeService;

      childObject = { ...childObject, ...instance.childObject };
    }
    return childObject;
  }
  getFixedChildBy(key: string): string {
    let context: TypeContext | undefined = this.context;
    while (context?.level) {
      context = context.parentObject;
      const instance = context?.instance as ObjectTypeService;
      if (instance.name === 'object') {
        const maybeName = instance.getFixedChildPath(key);
        if (maybeName) {
          return maybeName;
        }
      }
    }
    throw new Error('');
  }
}
