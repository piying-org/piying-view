import { useMemo } from 'react';
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
import { convert } from '@piying/view-core';
import { ReactSchemaHandle } from '../schema-handle';
import { ReactFormBuilder } from '../builder';
import { initListen } from '../util/init-listen';
import { useEffectSync } from '../util/use-effect-sync';
export interface PiyingViewProps {
  schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
  model?: any;
  modelChange?: (value: any) => void;
  options: any;
}
export function PiyingView(props: PiyingViewProps) {
  const rootInjector = useMemo(() => {
    return createRootInjector({
      providers: [
        {
          provide: ChangeDetectionScheduler,
          useClass: ChangeDetectionSchedulerImpl,
        },
      ],
    });
  }, []);
  const [field, subInjector] = useMemo(() => {
    const subInjector = createInjector({ providers: [], parent: rootInjector });
    const field = convert(props.schema as any, {
      handle: ReactSchemaHandle as any,
      builder: ReactFormBuilder,
      injector: subInjector,
      registerOnDestroy: (fn) => {
        subInjector!.get(DestroyRef).onDestroy(fn);
      },
      ...props.options,
    });
    return [field, subInjector];
  }, [props.schema, props.options]);
  useEffectSync(() => {
    let ref: EffectRef | undefined;
    if (field.form.control) {
      const model = props.model;
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
  }, [field]);
  useEffectSync(() => {
    field!.form.control?.updateValue(props.model);
  }, [field, props.model]);
  return (
    <>
      <InjectorToken value={rootInjector}>
        <PiyingFieldTemplate field={field}></PiyingFieldTemplate>
      </InjectorToken>
    </>
  );
}
