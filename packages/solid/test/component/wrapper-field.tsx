import { PI_VIEW_FIELD_TOKEN } from '@piying/view-solid';
import { useContext } from 'solid-js';

export function WrapperField(props: { emitField: (value: any) => void; children: any }) {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  props.emitField(field);
  return (
    <>
      <div class="wrapper-field">{props.children}</div>
    </>
  );
}
