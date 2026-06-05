import {
  PI_INPUT_MODEL_TOKEN,
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
} from '@piying/view-core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-react';
import { useContext } from 'react';

export function Token(props: { tokenChange: (value: any) => void }) {
  const field = useContext(PI_VIEW_FIELD_TOKEN)!;
  props.tokenChange({
    options: field.injector.get(PI_INPUT_OPTIONS_TOKEN),
    schema: field.injector.get(PI_INPUT_SCHEMA_TOKEN),
    model: field.injector.get(PI_INPUT_MODEL_TOKEN),
  });
  return (
    <>
      <div></div>
    </>
  );
}
