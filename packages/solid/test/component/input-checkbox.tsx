import type { ControlValueAccessor } from '@piying/view-core';
import {
  CVA,
  useControlValueAccessor,
  useInputCheckboxModel,
} from '@piying/view-solid';
import { createMemo, type Setter } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}
export function PiInputCheckbox(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  const inputModel = useInputCheckboxModel(result.cvaa);

  return (
    <>
      <input type="checkbox" {...inputModel()} />
    </>
  );
}
