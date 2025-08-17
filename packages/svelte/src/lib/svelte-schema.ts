import { CoreSchemaHandle } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from './type/group';

export class SvelteSchemaHandle extends CoreSchemaHandle<
	SvelteSchemaHandle,
	() => PiResolvedViewFieldConfig
> {
	declare type?: any;

}
