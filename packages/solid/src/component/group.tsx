import { For, useContext } from 'solid-js';
import { PiyingFieldTemplate } from './field-template';
import { PI_VIEW_FIELD_TOKEN } from '../token';
import { useSignalToRef } from '../util';

export function PiyingGroup() {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  const children = useSignalToRef(() => field?.children!())!;
  return (
    <For each={children()}>
      {(field) => {
        return <PiyingFieldTemplate field={field}></PiyingFieldTemplate>;
      }}
    </For>
  );
}
