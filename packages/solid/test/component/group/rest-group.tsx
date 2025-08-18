import {
  PI_VIEW_FIELD_TOKEN,
  PiyingFieldTemplate,
  useSignalToRef,
} from '@piying/view-solid';
import { For, useContext } from 'solid-js';

export function RestGroup() {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  const fixedChildren = useSignalToRef(() => field?.fixedChildren!())!;
  const restChildren = useSignalToRef(() => field?.restChildren!())!;
  return (
    <>
      <div class="fields">
        <For each={fixedChildren()}>
          {(field) => {
            return <PiyingFieldTemplate field={field}></PiyingFieldTemplate>;
          }}
        </For>
      </div>
      <div class="rest-fields">
        <For each={restChildren()}>
          {(field) => {
            return <PiyingFieldTemplate field={field}></PiyingFieldTemplate>;
          }}
        </For>
      </div>
    </>
  );
}
