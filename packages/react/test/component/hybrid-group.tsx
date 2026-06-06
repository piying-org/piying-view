import {
  PI_VIEW_FIELD_TOKEN,
  PiyingFieldTemplate,
  Field,
} from '@piying/view-react';
import { useContext } from 'react';

export default function HybridGroup() {
  const field = useContext(PI_VIEW_FIELD_TOKEN)!;

  return (
    <>
      <Field field={field} path={['k1']}>
        {({ cvaa }) => (
          <div className="mode1-wrapper">
            <input
              className="mode1"
              type="text"
              value={cvaa.value}
              onChange={(e) => cvaa.valueChange(e.target.value)}
              disabled={cvaa.disabled}
              onBlur={() => cvaa.touchedChange()}
            />
          </div>
        )}
      </Field>
      <PiyingFieldTemplate field={field} path={['k2']} />
    </>
  );
}
