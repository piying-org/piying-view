import type { ControlValueAccessor } from '@piying/view-core';
import {
  CVA,
  useControlValueAccessor,
  useInputNumberModel,
} from '@piying/view-solid';
import { createMemo, type Setter } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}
export function PiInputNumber(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  const inputModel = useInputNumberModel(result.cvaa);
  return (
    <>
      <input type="number" {...inputModel()} />
    </>
  );
}
