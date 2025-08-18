import type { ControlValueAccessor } from '@piying/view-core';
import {
  CVA,
  useControlValueAccessor,
  useSelectModel,
} from '@piying/view-solid';
import { createMemo, type Setter } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}
export function PiSelect(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  const selectModel = useSelectModel(result.cvaa, false);

  return (
    <>
      <select {...selectModel()}>
        <option class="r1" value={'v1'}>
          l1
        </option>
        <option class="r2" value={'v2'}>
          l2
        </option>
      </select>
    </>
  );
}
