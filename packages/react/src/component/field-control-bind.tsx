import { useMemo, useEffect, useRef } from 'react';
import type { KeyPath, PiFieldBindPath, PiFieldGet, PiFieldValueOf } from '@piying/view-core';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../type';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';
import { useControlValueAccessor } from '../util/use-control-value-accessor';

/** 渲染作用域: cvaa / field 都按 path 指向的字段推导 */
export type FieldControlBindScope<S, P extends KeyPath> = {
  cvaa: ControlValueAccessorAdapter<PiFieldValueOf<PiFieldGet<S, P>>>;
  field: PiFieldGet<S, P>;
};

export interface FieldControlBindProps<
  S extends PiResolvedViewFieldConfig = PiResolvedViewFieldConfig,
  P extends KeyPath = [],
> {
  field: S;
  path?: [...P]| PiFieldBindPath<S>;
  children: (props: FieldControlBindScope<S, P>) => React.ReactNode;
}

export function PiyingField<
  S extends PiResolvedViewFieldConfig = PiResolvedViewFieldConfig,
  P extends KeyPath = [],
>(props: FieldControlBindProps<S, P>) {
  const { field, path, children } = props;
  const disposeRef = useRef<((destroy?: boolean) => void) | undefined>(
    undefined,
  );

  const resolvedField = useMemo(() => {
    const keyPath = path;
    return keyPath ? field.get(keyPath as KeyPath) : field;
  }, [field, path]);

  const { cva, cvaa } = useControlValueAccessor();

  useEffect(() => {
    disposeRef.current?.();
    const control = resolvedField?.form.control;
    if (!control) {
      throw new Error(
        `📍 fieldControlBind:[${field?.keyPath || ''}]->[${path || ''}]❗`,
      );
    }
    if (!isFieldControl(control)) {
      throw new Error(`🏷️ fieldControl❗`);
    }
    disposeRef.current = createViewControlLink(
      () => control,
      cva,
      field.injector,
    );
  }, [resolvedField, field.injector, path]);

  useEffect(() => {
    return () => {
      disposeRef.current?.(true);
      disposeRef.current = undefined;
    };
  }, []);

  return children({
    cvaa: cvaa as unknown as FieldControlBindScope<S, P>['cvaa'],
    field: resolvedField as unknown as FieldControlBindScope<S, P>['field'],
  });
}

/** @deprecated 已废弃，请使用 {@link PiyingField} */
export const Field = PiyingField;
