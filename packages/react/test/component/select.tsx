import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor, useSelectModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}
export function PiSelect(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);  const selectModel = useSelectModel(cvaa, false);
  return (
    <>
      <select {...selectModel}>
        <option className="r1" value={'v1'}>
          l1
        </option>
        <option className="r2" value={'v2'}>
          l2
        </option>
      </select>
    </>
  );
}
