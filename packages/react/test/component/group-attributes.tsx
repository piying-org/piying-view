import type { PiResolvedViewFieldConfig } from '@piying/view-react';

export interface PiyingGroupProps {
  fields: PiResolvedViewFieldConfig[];
  class: string;
}
export function GroupAttr(props: PiyingGroupProps) {
  return (
    <>
      <div className={'group-attr ' + props.class}></div>
    </>
  );
}
