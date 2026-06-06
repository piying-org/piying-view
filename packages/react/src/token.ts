import type { Injector } from 'static-injector';
import type { PiResolvedViewFieldConfig } from './type/group';
import { createContext } from 'react';

export const PI_VIEW_FIELD_TOKEN = createContext<
  PiResolvedViewFieldConfig | undefined
>(undefined);
export const InjectorToken = createContext<Injector | undefined>(undefined);

export const CVA = Symbol.for('ControlValueAccessor');
