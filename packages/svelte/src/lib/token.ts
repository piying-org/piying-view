import type { PiResolvedViewFieldConfig } from './type/group';

export const InjectorToken = Symbol();
export const PI_VIEW_FIELD_TOKEN = Symbol();
export type PI_VIEW_FIELD_TOKEN = () => PiResolvedViewFieldConfig;
