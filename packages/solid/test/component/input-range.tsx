import type { ControlValueAccessor } from '@piying/view-core';
import {
  CVA,
  useControlValueAccessor,
  useInputRangeModel,
} from '@piying/view-solid';
import { createMemo, type Setter } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}
export function PiInputRange(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  const inputModel = useInputRangeModel(result.cvaa);

  return (
    <>
      <input type="range" {...inputModel()} />
    </>
  );
}
