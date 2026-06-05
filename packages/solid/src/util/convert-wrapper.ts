import {
  type _PiResolvedCommonViewFieldConfig,
  createConvertToField,
} from '@piying/view-core';
import { SolidFormBuilder } from '../builder';
import { SolidSchemaHandle } from '../schema-handle';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createRootInjector,
} from 'static-injector';

const DefaultConvertOptions = {
  builder: SolidFormBuilder,
  handle: SolidSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(
  DefaultConvertOptions,
  createRootInjector({
    providers: [
      {
        provide: ChangeDetectionScheduler,
        useClass: ChangeDetectionSchedulerImpl,
      },
    ],
  }),
);
