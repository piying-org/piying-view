import type { PiResolvedViewFieldConfig } from '../type';
import { PiyingFieldTemplate } from './field-template';

export interface PiyingGroupProps {
  fields: PiResolvedViewFieldConfig[];
  restFields: PiResolvedViewFieldConfig[];
}
export function PiyingGroup(props: PiyingGroupProps) {
  return (
    <>
      {props.fields.map((field, index) => {
        return (
          <PiyingFieldTemplate field={field} key={index}></PiyingFieldTemplate>
        );
      })}
    </>
  );
}
