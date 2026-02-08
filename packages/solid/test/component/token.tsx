import {
  PI_INPUT_MODEL_TOKEN,
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
} from '@piying/view-solid';
import { useContext } from 'solid-js';

export function Token(props: { tokenChange: (value: any) => void }) {
  props.tokenChange({
    options: useContext(PI_INPUT_OPTIONS_TOKEN),
    schema: useContext(PI_INPUT_SCHEMA_TOKEN),
    model: useContext(PI_INPUT_MODEL_TOKEN),
  });
  return (
    <>
      <div></div>
    </>
  );
}
