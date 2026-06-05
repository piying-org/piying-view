import { createMemo, createEffect, onCleanup } from 'solid-js';
import type { JSX } from 'solid-js/jsx-runtime';
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
  }) => JSX.Element;
}

let disposeRef: ((destroy?: boolean) => void) | undefined = undefined;

export function Field(props: FieldControlBindProps) {
  const { field, path, children } = props;

  // 清理之前的引用
  if (disposeRef) {
    disposeRef(true);
    disposeRef = undefined;
  }

  const resolvedField = createMemo(() => {
    const keyPath = path;
    return keyPath ? field.get(keyPath)! : field;
  });

  const { cva, cvaa } = useControlValueAccessor();

  createEffect(() => {
    const resolved = resolvedField();
    const control = resolved?.form.control;
    if (!control) {
      throw new Error(
        `📍 fieldControlBind:[${field?.keyPath || ''}]->[${path || ''}]❗`,
      );
    }
    if (!isFieldControl(control)) {
      throw new Error(`🏷️ fieldControl❗`);
    }
    disposeRef = createViewControlLink(
      () => control,
      cva,
      field.injector,
    );
  });

  onCleanup(() => {
    disposeRef?.(true);
    disposeRef = undefined;
  });

  return children({ cvaa, field: resolvedField()! });
}
