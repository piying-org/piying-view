import { JsonSchemaDraft202012 } from '@hyperjump/json-schema/draft-2020-12';
import { BaseAction, OptionJSType } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
import { isBoolean } from 'es-toolkit';
import { createImpasseAction } from '../../util/validation';
export class ArrayTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'array';
  actionList: BaseAction[] = [];
  override getExtraActionList(): BaseAction[] {
    return this.actionList;
  }
  override getBaseDefine() {
    const actionList = this.actionList;

    const schema = this.schema;
    let parent: v.BaseSchema<any, any, any>;
    const fixedItems = schema.prefixItems;
    if (isBoolean(schema.contains) && !schema.contains) {
      actionList.push(createImpasseAction('contains', schema.contains));
    } else if (schema.contains && !isBoolean(schema.contains)) {
      const containsSchema = this.commonTypeParse(schema.contains!)!;
      const minContains = schema.minContains ?? 1;
      actionList.push(
        v.check((list) => {
          if (Array.isArray(list)) {
            const result = list.filter(
              (item) => v.safeParse(containsSchema, item).success,
            );
            if (result.length < minContains) {
              return false;
            }

            if (typeof schema.maxContains === 'number') {
              return result.length <= schema.maxContains;
            }

            return true;
          }
          return false;
        }),
      );
    }
    const jSchemaToVSchema = (schema: JsonSchemaDraft202012) => {
      const hasRef = this.schemahasRef(schema);
      return hasRef
        ? v.lazy(() => this.commonTypeParse(schema!))
        : this.commonTypeParse(schema);
    };
    if (fixedItems && fixedItems.length) {
      const fixedList = fixedItems.map((item) => jSchemaToVSchema(item));
      if (schema.items) {
        const result = jSchemaToVSchema(schema.items);
        parent = v.tupleWithRest(fixedList, result!);
      } else if (schema.items === false) {
        parent = v.tuple(fixedList);
      } else {
        parent = v.looseTuple(fixedList);
      }
    } else if (isBoolean(schema.items)) {
      parent = schema.items ? v.array(v.any()) : v.tuple([]);
    } else if (schema.items) {
      const result = jSchemaToVSchema(schema.items);
      parent = v.array(result);
    } else {
      parent = v.array(v.any());
    }
    return parent!;
  }
}
