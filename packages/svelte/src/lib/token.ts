import type { Injector } from 'static-injector';
import type { ComputedRef, InjectionKey } from 'vue';
import type { PiResolvedViewFieldConfig } from './type/group';

export const InjectorToken = Symbol()
export const PI_VIEW_FIELD_TOKEN: InjectionKey<ComputedRef<PiResolvedViewFieldConfig>> = Symbol();
export const CVA = Symbol.for('ControlValueAccessor');
