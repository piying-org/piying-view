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
import {
  InjectorToken,
  PI_INPUT_MODEL_TOKEN,
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
  PI_VIEW_FIELD_TOKEN,
} from '../token';
import { PiyingFieldTemplate } from './field-template';
import { convert, initListen } from '@piying/view-core';
import { ReactSchemaHandle } from '../schema-handle';
import { ReactFormBuilder } from '../builder';
import { useEffectSync } from '../util/use-effect-sync';
export interface PiyingViewProps {
  schema: v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
  model?: any;
  modelChange?: (value: any) => void;
  options: { injector?: Injector; builder?: any; [name: string]: any };
}
export function PiyingView(props: PiyingViewProps) {
  const maybeParentField = useContext(PI_VIEW_FIELD_TOKEN);

  const rootInjector = useMemo(() => {
    return (
      props.options.injector ??
      maybeParentField?.injector ??
      createRootInjector({
        providers: [
          {
            provide: ChangeDetectionScheduler,
            useClass: ChangeDetectionSchedulerImpl,
          },
        ],
      })
    );
  }, [props.options.injector, maybeParentField?.injector]);
  const injectorDispose = useRef<(() => void) | undefined>(undefined);

  const [field, subInjector] = useMemo(() => {
    injectorDispose.current?.();
    const subInjector = createInjector({ providers: [], parent: rootInjector });
    injectorDispose.current = () => {
      subInjector.destroy();
      injectorDispose.current = undefined;
    };
    const field = convert(props.schema as any, {
      ...props.options,
      handle: ReactSchemaHandle as any,
      builder: ReactFormBuilder,
      injector: subInjector,
    });
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
      <PI_INPUT_OPTIONS_TOKEN value={props.options}>
        <PI_INPUT_SCHEMA_TOKEN value={props.schema}>
          <PI_INPUT_MODEL_TOKEN value={props.model}>
            <InjectorToken value={rootInjector}>
              <PiyingFieldTemplate field={field}></PiyingFieldTemplate>
            </InjectorToken>
          </PI_INPUT_MODEL_TOKEN>
        </PI_INPUT_SCHEMA_TOKEN>
      </PI_INPUT_OPTIONS_TOKEN>
    </>
  );
}
