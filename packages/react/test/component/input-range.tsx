import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor, useInputRangeModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}
export function PiInputRange(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);  const inputModel = useInputRangeModel(cvaa);

  return (
    <>
      <input type="range" {...inputModel} />
    </>
  );
}
