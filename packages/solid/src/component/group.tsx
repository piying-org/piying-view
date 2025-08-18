import { For, useContext } from 'solid-js';
import { PiyingFieldTemplate } from './field-template';
import { PI_VIEW_FIELD_TOKEN } from '../token';
import { createSignalConvert } from '../util';

export function PiyingGroup() {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  const children = createSignalConvert(() => field?.children!())!;
  return (
    <For each={children()}>
      {(field) => {
        return <PiyingFieldTemplate field={field}></PiyingFieldTemplate>;
      }}
    </For>
  );
}
