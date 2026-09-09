import { Component, input } from '@angular/core';
import { PiyingView } from '@piying/view-angular';
import { FieldGlobalConfig } from './define';
import {
  actionSchema,
  arraySchema,
  booleanSchema,
  componentUseSchema,
  contextSchema,
  contextSchemaContext,
  contextSchemaOptions,
  defaultSchema,
  filterGroupSchema,
  layoutSchema,
  looseObjectSchema,
  looseTupleSchema,
  nfcSchema,
  nestedSchema,
  numberSchema,
  objectSchema,
  objectWithRestSchema,
  picklistSchema,
  rawSchema,
  recordSchema,
  scrollGroupSchema,
  selectorlessSchema,
  stringSchema,
  tabsGroupSchema,
  tupleSchema,
  tupleWithRestSchema,
  validGroupSchema,
  formUseObjectSchema,
  formUseLooseObjectSchema,
  formUseObjectWithRestSchema,
  formUseRecordSchema,
  formUseTupleSchema,
  formUseLooseTupleSchema,
  formUseTupleWithRestSchema,
  formUseArraySchema,
} from './definition';
import * as v from 'valibot';

/**
 * 通用「定义 → 表单」演示组件。
 * 通过 `name` 选择要展示的定义，结合全局 FieldGlobalConfig 自动渲染为对应表单。
 * schema 在组件内部引用，避免经 Astro 序列化丢失 Valibot 内部方法。
 */
const schemas: Record<string, v.BaseSchema<any, any, any>> = {
  string: stringSchema,
  number: numberSchema,
  boolean: booleanSchema,
  picklist: picklistSchema,
  object: objectSchema,
  looseObject: looseObjectSchema,
  objectWithRest: objectWithRestSchema,
  record: recordSchema,
  array: arraySchema,
  tuple: tupleSchema,
  looseTuple: looseTupleSchema,
  tupleWithRest: tupleWithRestSchema,
  default: defaultSchema,
  nested: nestedSchema,
  'component-use': componentUseSchema,
  nfc: nfcSchema,
  action: actionSchema,
  context: contextSchema,
  raw: rawSchema,
  selectorless: selectorlessSchema,
  'filter-group': filterGroupSchema,
  'scroll-group': scrollGroupSchema,
  'tabs-group': tabsGroupSchema,
  layout: layoutSchema,
  'valid-group': validGroupSchema,
  'form-use-object': formUseObjectSchema,
  'form-use-loose-object': formUseLooseObjectSchema,
  'form-use-object-with-rest': formUseObjectWithRestSchema,
  'form-use-record': formUseRecordSchema,
  'form-use-tuple': formUseTupleSchema,
  'form-use-loose-tuple': formUseLooseTupleSchema,
  'form-use-tuple-with-rest': formUseTupleWithRestSchema,
  'form-use-array': formUseArraySchema,
};

const defaultModels: Record<string, unknown> = {
  array: { list: ['v1'] },
  looseObject: { k1: 'v1', k2: 2 },
  objectWithRest: { k1: 'v1', k2: 2 },
  record: { o1: { k1: 'v1' } },
  tuple: { list: ['v1'] },
  looseTuple: { list: ['v1', 'v2'] },
  tupleWithRest: { list: ['v1', 'v2'] },
  'form-use-object': { k1: 'v1', k2: 2 },
  'form-use-loose-object': { k1: 'v1', k2: 2 },
  'form-use-object-with-rest': { k1: 'v1', k2: 2 },
  'form-use-record': { o1: { k1: 'v1' } },
  'form-use-tuple': { list: ['v1'] },
  'form-use-loose-tuple': { list: ['v1', 'v2'] },
  'form-use-tuple-with-rest': { list: ['v1', 'v2'] },
  'form-use-array': { list: ['v1'] },
};

@Component({
  selector: 'schema-demo',
  standalone: true,
  template: `
    <piying-view [schema]="schema()" [model]="model()" [options]="options()"></piying-view>
  `,
  imports: [PiyingView],
})
export class SchemaDemoComponent {
  name = input('string');
  modelInput = input<unknown>();

  options() {
    if (this.name() === 'context') {
      return contextSchemaOptions;
    }
    return { fieldGlobalConfig: FieldGlobalConfig };
  }

  schema() {
    return schemas[this.name()];
  }

  model() {
    if (this.name() === 'context') {
      return undefined;
    }
    return this.modelInput() ?? defaultModels[this.name()];
  }
}
