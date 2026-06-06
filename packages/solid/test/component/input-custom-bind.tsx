import type { _PiResolvedCommonViewFieldConfig } from '@piying/view-core';
import { Field } from '../../src';

export default function InputCustomBind({ field }: { field: _PiResolvedCommonViewFieldConfig }) {
  return (
    <Field field={field}>
      {({ cvaa }) => (
        <div>
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
  );
}
