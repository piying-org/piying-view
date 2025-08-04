import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor, useInputTextModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}
export function PiInput(props: PiInputOptions) {
   const { cva, cvaa } = useControlValueAccessor();
   useImperativeHandle(props[CVA], () => cva, [cva]);
  const textModel = useInputTextModel(cvaa, false);
  return (
    <>
      <input type="text" {...textModel} />
    </>
  );
}
