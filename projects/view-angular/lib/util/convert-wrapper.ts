import { Injector, Signal } from '@angular/core';
import {
  _PiResolvedCommonViewFieldConfig,
  createConvertToField,
} from '@piying/view-angular-core';
import { AngularFormBuilder } from '../builder';
import { NgSchemaHandle } from '../schema/ng-schema';

import { NgConvertOptions } from '../type/builder-type';
import * as v from 'valibot';

const DefaultConvertOptions = {
  builder: AngularFormBuilder,
  handle: NgSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(DefaultConvertOptions);
