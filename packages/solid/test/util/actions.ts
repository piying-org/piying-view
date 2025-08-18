import type { GetFieldType } from '@piying/view-core/test';
import { getField as cGetField } from '@piying/view-core/test';
import type { PiResolvedViewFieldConfig } from '../../src/type';

export const getField: GetFieldType<PiResolvedViewFieldConfig> = cGetField as any;
