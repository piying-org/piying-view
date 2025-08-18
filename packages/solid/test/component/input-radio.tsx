import type { ControlValueAccessor } from '@piying/view-core';
import {
  CVA,
  useControlValueAccessor,
  useInputRadioModel,
} from '@piying/view-solid';
import { createMemo, type Setter } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}
export function PiInputRadio(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  return (
    <>
      <input
        class="r1"
        type="radio"
        name="r1"
        {...useInputRadioModel(result.cvaa, 'v1')()}
      />
      <input
        class="r2"
        type="radio"
        name="r1"
        {...useInputRadioModel(result.cvaa, 'v2')()}
      />
    </>
  );
}
