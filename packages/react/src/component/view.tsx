import { useEffect, useMemo, useRef } from 'react';
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
import { ReactSchemaHandle } from '../schema-handle';
import { ReactFormBuilder } from '../builder';
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
  const injectorDispose = useRef<(() => void) | undefined>(undefined);

  const [field, subInjector] = useMemo(() => {
    injectorDispose.current?.();
    const subInjector = createInjector({ providers: [], parent: rootInjector });
    injectorDispose.current = () => {
      subInjector.destroy();
      injectorDispose.current = undefined;
    };
    const field = convert(props.schema as any, {
      handle: ReactSchemaHandle as any,
      builder: ReactFormBuilder,
      injector: subInjector,
      ...props.options,
    });
    return [field, subInjector];
  }, [props.schema, props.options]);
  useEffect(() => {
    return () => {
      injectorDispose.current?.();
    };
  }, []);
  useEffectSync(() => {
    let ref: EffectRef | undefined;
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
      field!.form.control.updateValue(props.model);
    }
    return () => {
      ref?.destroy();
    };
  }, [field, props.model]);

  return (
    <>
      <InjectorToken value={rootInjector}>
        <PiyingFieldTemplate field={field}></PiyingFieldTemplate>
      </InjectorToken>
    </>
  );
}
