import { useMemo, useEffect, useRef } from 'react';
import type { KeyPath } from '@piying/view-core';
import { createViewControlLink, isFieldControl } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../type';
import { useControlValueAccessor } from '../util/use-control-value-accessor';

export interface FieldControlBindProps {
  field: PiResolvedViewFieldConfig;
  path?: KeyPath;
  children: (props: {
    cvaa: any;
    field: PiResolvedViewFieldConfig;
  }) => React.ReactNode;
}

export function Field(props: FieldControlBindProps) {
  const { field, path, children } = props;
  const disposeRef = useRef<((destroy?: boolean) => void) | undefined>(
    undefined,
  );

  const resolvedField = useMemo(() => {
    const keyPath = path;
    return keyPath ? field.get(keyPath) : field;
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

  return children({ cvaa, field: resolvedField! });
}
