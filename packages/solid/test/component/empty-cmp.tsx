import { createMemo } from 'solid-js';

export function EmptyCmp(props: { input1?: string; class: string }) {
  const classNames = createMemo(() => `empty-cmp ${props.class}`,);
  return <div class={classNames()}>{props.input1 ?? ''}</div>;
}
