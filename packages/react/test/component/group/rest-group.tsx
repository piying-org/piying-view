import type { PiResolvedViewFieldConfig } from '@piying/view-react';
import { PiyingFieldTemplate } from '@piying/view-react';

export interface PiyingGroupProps {
  fields: PiResolvedViewFieldConfig[];
  restFields: PiResolvedViewFieldConfig[];
}
export function RestGroup(props: PiyingGroupProps) {
  return (
    <>
      <div className="fields">
        {props.fields.map((field, index) => {
          return (
            <PiyingFieldTemplate
              field={field}
              key={index}
            ></PiyingFieldTemplate>
          );
        })}
      </div>
      <div className="rest-fields">
        {props.restFields.map((field, index) => {
          return (
            <PiyingFieldTemplate
              field={field}
              key={index}
            ></PiyingFieldTemplate>
          );
        })}
      </div>
    </>
  );
}
