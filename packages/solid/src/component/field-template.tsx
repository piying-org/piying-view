import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  useContext,
} from 'solid-js';
import type { PiResolvedViewFieldConfig } from '../type';
import { CVA, InjectorToken, PI_VIEW_FIELD_TOKEN } from '../token';
import { createSignalConvert } from '../util/signal-convert';
import { PiyingWrapper } from './wrapper';
import {
  createViewControlLink,
  type ControlValueAccessor,
} from '@piying/view-core';
export interface PiyingFieldTemplateProps {
  field: PiResolvedViewFieldConfig;
}

export function PiyingFieldTemplate(props: PiyingFieldTemplateProps) {
  const fieldInputs = createSignalConvert(() => ({
    ...props.field.attributes(),
    ...props.field.inputs(),
    ...props.field.outputs(),
  }));
  const renderConfig = createSignalConvert(() => props.field.renderConfig());
  const wrappers = createSignalConvert(() => props.field.wrappers());
  const define = createSignalConvert(() => props.field.define?.());
  const control = createMemo(() => props.field.form.control);
  const ComponentType$$ = createMemo(() => define()?.type);
  const isHidden = createMemo(() => {
    return !!renderConfig().hidden || !ComponentType$$();
  });
  const injector = useContext(InjectorToken)!;

  const [controlRef, setControlRef] = createSignal<
    ControlValueAccessor | undefined
  >(undefined);
  const fieldControlInput = createMemo(
    () =>
      ({
        ...fieldInputs(),
        [CVA]: setControlRef,
      }) as Record<any, any>,
  );

  createEffect(() => {
    let dispose: (() => any) | undefined;
    if (controlRef()) {
      dispose = createViewControlLink(control as any, controlRef()!, injector);
    }
    return () => {
      dispose?.();
      dispose = undefined;
    };
  });

  return (
    <>
      <PI_VIEW_FIELD_TOKEN.Provider value={props.field}>
        <Show when={!isHidden()}>
          <PiyingWrapper wrappers={wrappers()}>
            <Show when={ComponentType$$()} keyed>
              {(ComponentType) => (
                <Show
                  when={props.field.form.control}
                  fallback={<ComponentType {...fieldInputs()}></ComponentType>}
                >
                  <ComponentType {...fieldControlInput()}></ComponentType>
                </Show>
              )}
            </Show>
          </PiyingWrapper>
        </Show>
      </PI_VIEW_FIELD_TOKEN.Provider>
    </>
  );
}
