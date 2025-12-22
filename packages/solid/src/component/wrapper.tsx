import type { CoreWrapperConfig } from '@piying/view-core';
import { createSignalConvert } from '../util/signal-convert';
import { createMemo, Show } from 'solid-js';

export interface PiyingWrapperProps {
  wrappers: CoreWrapperConfig[];
  children: any;
}

export function PiyingWrapper(props: PiyingWrapperProps) {
  const wrapper = createMemo(() => props.wrappers[0]);
  const restWrappers = createMemo(() => props.wrappers?.slice(1));
  const inputs = createSignalConvert(() => ({
    ...wrapper()?.inputs(),
    ...wrapper()?.attributes(),
    ...wrapper()?.outputs?.(),
  }));
  return (
    <Show
      when={createMemo(() => wrapper()?.type)()}
      fallback={props.children}
      keyed
    >
      {(WrapperType) => {
        return (
          <WrapperType {...inputs()}>
            <PiyingWrapper wrappers={restWrappers()}>
              {props.children}
            </PiyingWrapper>
          </WrapperType>
        );
      }}
    </Show>
  );
}
