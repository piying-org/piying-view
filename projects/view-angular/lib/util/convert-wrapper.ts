import { createConvertToField } from '@piying/view-angular-core';
import { AngularFormBuilder } from '../builder';
import { NgSchemaHandle } from '../schema/ng-schema';

const DefaultConvertOptions = {
  builder: AngularFormBuilder,
  handle: NgSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(DefaultConvertOptions);
