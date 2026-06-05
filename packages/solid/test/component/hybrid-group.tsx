import {
  PI_VIEW_FIELD_TOKEN,
  PiyingFieldTemplate,
  Field,
} from '@piying/view-solid';
import { useContext } from 'solid-js';

export default function HybridGroup() {
  const field = useContext(PI_VIEW_FIELD_TOKEN)!;

  return (
    <>
      <Field field={field} path={['k1']}>
        {({ cvaa }) => (
          <div class="mode1-wrapper">
            <input
              class="mode1"
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
