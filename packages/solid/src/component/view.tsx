import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createInjector,
  createRootInjector,
  DestroyRef,
  Injector,
  untracked,
  type EffectRef,
} from 'static-injector';
import * as v from 'valibot';
import { InjectorToken } from '../token';
import { PiyingFieldTemplate } from './field-template';
import { convert, initListen } from '@piying/view-core';
import { SolidSchemaHandle } from '../schema-handle';
import { SolidFormBuilder } from '../builder';
import { createMemo, untrack } from 'solid-js';
import { useEffectSync } from '../util';
export interface PiyingViewProps {
  schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
  model?: any;
  modelChange?: (value: any) => void;
  options: any;
}
export function PiyingView(props: PiyingViewProps) {
  const rootInjector = createRootInjector({
    providers: [
      {
        provide: ChangeDetectionScheduler,
        useClass: ChangeDetectionSchedulerImpl,
      },
    ],
  });
  const initResult = createMemo(() => {
    const subInjector = createInjector({ providers: [], parent: rootInjector });
    const field = convert(props.schema as any, {
      handle: SolidSchemaHandle as any,
      builder: SolidFormBuilder,
      injector: subInjector,
      registerOnDestroy: (fn) => {
        subInjector!.get(DestroyRef).onDestroy(fn);
      },
      ...props.options,
    });
    return [field, subInjector] as const;
  });
  const field = createMemo(() => {
    return initResult()[0];
  });
  useEffectSync(() => {
    let ref: EffectRef | undefined;
    const [field, subInjector] = initResult();
    if (field.form.control) {
      const model = untrack(() => props.model);
      ref = initListen(
        typeof model !== 'undefined' ? model : undefined,
        field!.form.control!,
        subInjector as Injector,
        (value) => {
          untracked(() => {
            if (field!.form.control?.valueNoError$$()) {
              props.modelChange?.(value);
            }
          });
        },
      );
    }
    return () => {
      subInjector.destroy();
      ref?.destroy();
    };
  });
  createMemo(() => {
    field()!.form.control?.updateValue(props.model);
  });
  return (
    <>
      <InjectorToken.Provider value={rootInjector}>
        <PiyingFieldTemplate field={field()}></PiyingFieldTemplate>
      </InjectorToken.Provider>
    </>
  );
}
