import {
  ArraySchema,
  BaseSchema,
  BaseIssue,
  ErrorMessage,
  ArrayIssue,
} from 'valibot';

import * as v from 'valibot';

import {
  BaseSchemaHandle,
  convertSchema,
  DefaultSchema,
  EnumSchema,
  IntersectSchema,
  LazySchema,
  MetadataAction,
  ObjectSchema,
  Schema,
  SchemaOrPipe,
  TupleSchema,
  UnionSchema,
  VoidSchema,
} from '@piying/valibot-visit';
import {
  FieldRenderConfig,
  CoreRawViewOutputs,
  CoreRawWrapperConfig,
  CoreRawViewInputs,
  _PiResolvedCommonViewFieldConfig,
  HookConfig,
} from '../../builder-base';
import { FieldFormConfig } from '../../field/type';
import { KeyPath } from '../../util';
import { NonFieldControlAction } from '../action/non-field-control';

export class CoreSchemaHandle<
  Self extends CoreSchemaHandle<any, any>,
  RESOLVED_FN extends () => any,
> extends BaseSchemaHandle<Self> {
  inputs?: CoreRawViewInputs;
  outputs?: CoreRawViewOutputs;
  wrappers?: CoreRawWrapperConfig[];
  attributes?: Record<string, any>;
  events?: Record<string, (event: any) => any>;
  alias?: string;
  movePath?: KeyPath;
  renderConfig?: FieldRenderConfig;
  /** todo 非表单应该可选 */
  formConfig: FieldFormConfig = {};
  id?: string;
  isLogicAnd = false;
  isLogicOr = false;
  isArray = false;
  isTuple = false;
  nonFieldControl = false;
  hooks?: HookConfig<ReturnType<RESOLVED_FN>>;
  override lazySchema(schema: LazySchema): void {
    super.lazySchema(schema);
    if (this.parent) {
      const wrappered = this.lazyWrapped as any as Self;
      if (this.parent.isArray) {
        this.parent.arrayChild = wrappered;
      } else {
        const index = this.parent.children.findIndex((item) => item === this);
        this.parent.children[index] = wrappered;
      }
      wrappered!.parent = this.parent;
      wrappered!.key = this.key;
    }
  }
  override arraySchema(
    schema: ArraySchema<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<ArrayIssue> | undefined
    >,
  ): void {
    if (this.isObjectControl) {
      // 不需要设置默认值,因为item属于模板
      return;
    } else {
      this.isArray = true;
      const sh = new this.globalConfig.handle(
        this.globalConfig,
        this,
        schema.item,
      );
      sh.parent = this;
      this.arrayChild = sh;
      convertSchema(schema.item as SchemaOrPipe, sh);
      this.formConfig.groupMode = 'reset';
    }
  }

  override defaultSchema(schema: DefaultSchema): void {
    this.defaultValue = schema.literal;
  }
  override tupleDefault(schema: TupleSchema): void {
    super.tupleDefault(schema);
    this.isTuple = true;
    if (schema.type === 'tuple') {
      this.formConfig.groupMode = 'default';
    } else if (schema.type === 'loose_tuple') {
      this.formConfig.groupMode = 'loose';
    } else if (schema.type === 'strict_tuple') {
      this.formConfig.groupMode = 'strict';
    }
  }
  override objectDefault(schema: ObjectSchema): void {
    super.objectDefault(schema);
    if (schema.type === 'object') {
      this.formConfig.groupMode = 'default';
    } else if (schema.type === 'loose_object') {
      this.formConfig.groupMode = 'loose';
    } else if (schema.type === 'strict_object') {
      this.formConfig.groupMode = 'strict';
    }
  }
  override recordSchema(
    key: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    value: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  ): void {
    super.recordSchema(key, value);
    this.isGroup = true;
    // equal {[name:string]:v.InferOutput< typeof value>}
    this.formConfig.groupKeySchema = key;
    this.restSchema(value);
  }
  override restSchema(
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  ): void {
    super.restSchema(schema);
    const sh = new this.globalConfig.handle(this.globalConfig, this, schema);
    sh.parent = this;
    this.arrayChild = sh;
    convertSchema(schema as SchemaOrPipe, sh);
    this.formConfig.groupMode = 'reset';
  }
  override enumSchema(schema: EnumSchema): void {
    this.props ??= {};
    this.props['options'] ??= schema.options;
  }
  override intersectBefore(schema: IntersectSchema): void {
    if (this.childrenAsVirtualGroup) {
      // 临时修复,需要把action分为前后两个部分
      if (this.type === 'intersect') {
        this.type = 'intersect-group';
      }
    } else {
      this.isLogicAnd = true;
    }
  }
  override logicItemSchema(
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    index: number,
    type: 'intersect' | 'union',
  ): void {
    const sh = new this.globalConfig.handle(
      this.globalConfig,
      this as unknown as AnyCoreSchemaHandle,
      schema,
    );
    if (this.childrenAsVirtualGroup) {
    } else {
      sh.key = index;
    }
    sh.setParent(this);
    convertSchema(schema as SchemaOrPipe, sh);
  }
  override unionBefore(schema: UnionSchema): void {
    if (this.childrenAsVirtualGroup) {
      // 这个参数并不应该出现到这里,因为是专门为intersect设计
    } else {
      this.isLogicOr = true;
    }
  }

  override beforeSchemaType(schema: Schema): void {
    super.beforeSchemaType(schema);
    this.formConfig.required = !this.undefinedable && !this.nullable;
  }
  override voidSchema(schema: VoidSchema): void {
    this.nonFieldControl = true;
  }

  override metadataDefaulthandle(
    metadata: MetadataAction,
    environments: string[],
  ): void {
    switch (metadata.type as any) {
      case 'viewRawConfig': {
        (metadata as any).value(this as any, this.globalConfig.context);
        break;
      }
      case 'layout': {
        this.movePath = (metadata as any).value.keyPath;
        this.priority = (metadata as any).value.priority;
        break;
      }
      case 'nonFieldControl': {
        this.nonFieldControl = (metadata as any as NonFieldControlAction).value;
        break;
      }

      default:
        break;
    }
  }
  override end(schema: SchemaOrPipe): void {
    super.end(schema);
    this.formConfig.defaultValue = this.defaultValue;
  }
}
export type AnyCoreSchemaHandle = CoreSchemaHandle<
  any,
  () => _PiResolvedCommonViewFieldConfig
>;
