import type { GetFieldType } from '@piying/view-core/test';
import { getField as cGetField } from '@piying/view-core/test';
import type { PiResolvedViewFieldConfig } from '@piying/view-svelte';

export const getField: GetFieldType<PiResolvedViewFieldConfig> = cGetField as any;
