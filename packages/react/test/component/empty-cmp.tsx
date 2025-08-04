import { useMemo } from 'react';

export function EmptyCmp(props: { input1?: string; class: string }) {
  const classNames = useMemo(() => `empty-cmp ${props.class}`, [props.class]);
  return <div className={classNames}>{props.input1 ?? ''}</div>;
}
