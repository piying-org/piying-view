import type { GetFieldType } from '@piying/view-core/test';
import type { PiResolvedViewFieldConfig } from '../../formly/type/group';
import { getField as cGetField } from '@piying/view-core/test';

export const getField: GetFieldType<PiResolvedViewFieldConfig> = cGetField as any;
