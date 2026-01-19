import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createInjector,
  createRootInjector,
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
import { createMemo, onCleanup } from 'solid-js';
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
  let injectorDispose: (() => any) | undefined;

  const initResult = createMemo(() => {
    const subInjector = createInjector({ providers: [], parent: rootInjector });
    injectorDispose = () => {
      subInjector.destroy();
      injectorDispose = undefined;
    };
    const field = convert(props.schema as any, {
      handle: SolidSchemaHandle as any,
      builder: SolidFormBuilder,
      injector: subInjector,
      ...props.options,
    });
    return [field, subInjector] as const;
  });

  onCleanup(() => {
    injectorDispose?.();
  });

  const field = createMemo(() => {
    return initResult()[0];
  });
  useEffectSync(() => {
    let ref: EffectRef | undefined;
    const [field, subInjector] = initResult();
    if (field.form.control) {
      ref = initListen(
        props.model,
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
      field.form.control.updateValue(props.model);
    }
    return () => {
      ref?.destroy();
    };
  });

  return (
    <>
      <InjectorToken.Provider value={rootInjector}>
        <PiyingFieldTemplate field={field()}></PiyingFieldTemplate>
      </InjectorToken.Provider>
    </>
  );
}
