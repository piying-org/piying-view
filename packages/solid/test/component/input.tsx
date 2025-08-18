import type { ControlValueAccessor } from '@piying/view-core';
import {
  CVA,
  useControlValueAccessor,
  useInputTextModel,
} from '@piying/view-solid';
import { createMemo, type Setter } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}
export function PiInput(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  const textModel = useInputTextModel(result.cvaa, () => false);

  return (
    <>
      <input type="text" {...textModel()} />
    </>
  );
}
