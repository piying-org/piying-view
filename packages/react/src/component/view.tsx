import { useContext, useEffect, useMemo, useRef } from 'react';
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
import { type ConvertOptions } from '@piying/view-core';
import { InjectorToken, PI_VIEW_FIELD_TOKEN } from '../token';
import { PiyingFieldTemplate } from './field-template';
import { initListen } from '@piying/view-core';
import { convertToField } from '../util/convert-wrapper';
import { useEffectSync } from '../util/use-effect-sync';

export interface PiyingViewProps {
  schema: v.BaseSchema<any, any, any>;
  model?: any;
  modelChange?: (value: any) => void;
  options: ConvertOptions;
}

export function PiyingView(props: PiyingViewProps) {
  const maybeParentField = useContext(PI_VIEW_FIELD_TOKEN);

  const rootInjector = useMemo(
    () =>
      props.options.injector ??
      maybeParentField?.injector ??
      createRootInjector({
        providers: [
          {
            provide: ChangeDetectionScheduler,
            useClass: ChangeDetectionSchedulerImpl,
          },
        ],
      }),
    [props.options.injector, maybeParentField?.injector],
  );
  const injectorDispose = useRef<(() => void) | undefined>(undefined);

  const [field, subInjector] = useMemo(() => {
    injectorDispose.current?.();
    const subInjector = createInjector({ providers: [], parent: rootInjector });
    injectorDispose.current = () => {
      subInjector.destroy();
      injectorDispose.current = undefined;
    };
    const field = convertToField(
      () => props.schema,
      subInjector,
      () => props.options,
    );
    return [field, subInjector];
  }, [props.schema, props.options, rootInjector]);

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
