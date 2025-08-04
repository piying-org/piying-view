import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor, useInputCheckboxModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}
export function PiInputCheckbox(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  const inputModel = useInputCheckboxModel(cvaa);

  return (
    <>
      <input type="checkbox" {...inputModel} />
    </>
  );
}
