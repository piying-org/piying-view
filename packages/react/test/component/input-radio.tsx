import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor, useInputRadioModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}
export function PiInputRadio(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  return (
    <>
      <input className="r1" type="radio" name="r1" {...useInputRadioModel(cvaa, 'v1')} />
      <input className="r2" type="radio" name="r1" {...useInputRadioModel(cvaa, 'v2')} />
    </>
  );
}
