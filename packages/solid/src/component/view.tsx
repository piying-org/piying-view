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
import { createMemo, onCleanup, useContext } from 'solid-js';
import { useEffectSync } from '../util';

export interface PiyingViewProps {
  schema: v.BaseSchema<any, any, any>;
  model?: any;
  modelChange?: (value: any) => void;
  options: ConvertOptions;
}

export function PiyingView(props: PiyingViewProps) {
  const maybeParentField = useContext(PI_VIEW_FIELD_TOKEN);

  const rootInjector = createMemo(() => {
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
  });

  let injectorDispose: (() => any) | undefined;

  const initResult = createMemo(() => {
    injectorDispose?.();
    const subInjector = createInjector({
      providers: [],
      parent: rootInjector(),
    });
    injectorDispose = () => {
      subInjector.destroy();
      injectorDispose = undefined;
    };
    const field = convertToField(
      () => props.schema,
      subInjector,
      () => props.options,
    );
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
      <InjectorToken.Provider value={rootInjector()}>
        <PiyingFieldTemplate field={field()}></PiyingFieldTemplate>
      </InjectorToken.Provider>
    </>
  );
}
