import type { CoreWrapperConfig } from '@piying/view-core';
import { useMemo } from 'react';
import { useSignalToRef } from '../util/signal-convert';

export interface PiyingWrapperProps {
  wrappers: CoreWrapperConfig[];
  children: any;
}

export function PiyingWrapper(props: PiyingWrapperProps) {
  const restWrappers = useMemo(
    () => props.wrappers!.slice(1),
    [props.wrappers],
  );
  const wrapper = props.wrappers[0];
  const inputs = useSignalToRef(wrapper, () => ({
    ...wrapper?.inputs(),
    ...wrapper?.attributes(),
    ...wrapper?.outputs?.(),
  }));
  return (
    <>
      {wrapper ? (
        <wrapper.type {...inputs}>
          <PiyingWrapper wrappers={restWrappers}>
            {props.children}
          </PiyingWrapper>
        </wrapper.type>
      ) : (
        props.children
      )}
    </>
  );
}
