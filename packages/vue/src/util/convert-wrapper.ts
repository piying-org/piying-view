import {
  type _PiResolvedCommonViewFieldConfig,
  createConvertToField,
} from '@piying/view-core';
import { VueFormBuilder } from '../builder';
import { VueSchemaHandle } from '../vue-schema';

const DefaultConvertOptions = {
  builder: VueFormBuilder,
  handle: VueSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(DefaultConvertOptions);
