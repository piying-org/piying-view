import { createConvertToField } from '@piying/view-angular-core';
import { AngularFormBuilder } from '../builder';
import { NgSchemaHandle } from '../schema/ng-schema';

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField({
  builder: AngularFormBuilder,
  handle: NgSchemaHandle,
});
