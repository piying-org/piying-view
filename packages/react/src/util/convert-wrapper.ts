import {
  type _PiResolvedCommonViewFieldConfig,
  createConvertToField,
} from '@piying/view-core';
import { ReactFormBuilder } from '../builder';
import { ReactSchemaHandle } from '../schema-handle';

const DefaultConvertOptions = {
  builder: ReactFormBuilder,
  handle: ReactSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(DefaultConvertOptions);
