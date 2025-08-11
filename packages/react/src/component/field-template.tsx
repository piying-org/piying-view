import { useContext, useEffect, useMemo, useRef } from 'react';
import type { PiResolvedViewFieldConfig } from '../type';
import { InjectorToken, PI_VIEW_FIELD_TOKEN } from '../token';
import { useSignalToRef } from '../util/signal-convert';
import { PiyingWrapper } from './wrapper';
import {
  createViewControlLink,
  type ControlValueAccessor,
} from '@piying/view-core';
export interface PiyingFieldTemplateProps {
  field: PiResolvedViewFieldConfig;
}

export const CVA = Symbol.for('ControlValueAccessor');
export function PiyingFieldTemplate(props: PiyingFieldTemplateProps) {
  const inputs = useSignalToRef(props.field, (field) => field.inputs());
  const outputs = useSignalToRef(props.field, (field) => field.outputs());
  const attributes = useSignalToRef(props.field, (field) => field.attributes());
  const fieldInputs = useMemo(
    () => ({ ...attributes, ...inputs, ...outputs }),
    [attributes, inputs, outputs],
  );

  const renderConfig = useSignalToRef(props.field, (field) =>
    field.renderConfig(),
  );

  const fieldChildren = useSignalToRef(props.field, (field) =>
    field.children?.(),
  );

  const wrappers = useSignalToRef(props.field, (field) => field.wrappers());

  const control = props.field.form.control;

  const ComponentType = props.field.define?.type;

  const isHidden = useMemo(() => {
    return !!renderConfig.hidden || !ComponentType;
  }, [renderConfig.hidden, ComponentType]);
  const injector = useContext(InjectorToken)!;

  const controlRef = useRef<ControlValueAccessor>(undefined);
  const fieldControlInput = useMemo(
    () => ({ ...fieldInputs, [CVA]: controlRef }),
    [fieldInputs, controlRef],
  );

  useEffect(() => {
    let dispose: (() => any) | undefined;
    if (controlRef.current) {
      dispose = createViewControlLink(
        (() => control) as any,
        controlRef.current,
        injector,
      );
    }
    return () => {
      dispose?.();
      dispose = undefined;
    };
  }, [controlRef.current, control, injector]);
  return (
    <>
      <PI_VIEW_FIELD_TOKEN value={props.field}>
        {!isHidden ? (
          <PiyingWrapper wrappers={wrappers}>
            {fieldChildren ? (
              <ComponentType {...fieldInputs}></ComponentType>
            ) : props.field.form.control ? (
              <ComponentType {...fieldControlInput}></ComponentType>
            ) : (
              <ComponentType {...fieldInputs}></ComponentType>
            )}
          </PiyingWrapper>
        ) : undefined}
      </PI_VIEW_FIELD_TOKEN>
    </>
  );
}
