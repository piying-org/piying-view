import { PI_VIEW_FIELD_TOKEN } from '@piying/view-react';
import { useContext } from 'react';

export function WrapperField(props: { emitField: (value: any) => void; children: any }) {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  props.emitField(field);
  return (
    <>
      <div className="wrapper-field">{props.children}</div>
    </>
  );
}
