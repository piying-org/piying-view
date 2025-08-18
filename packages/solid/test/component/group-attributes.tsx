import type { PiResolvedViewFieldConfig } from '@piying/view-solid';

export interface PiyingGroupProps {
  fields: PiResolvedViewFieldConfig[];
  class: string;
}
export function GroupAttr(props: PiyingGroupProps) {
  return (
    <>
      <div class={'group-attr ' + props.class}></div>
    </>
  );
}
