import {
  PI_VIEW_FIELD_TOKEN,
  PiyingFieldTemplate,
  useSignalToRef,
} from '@piying/view-react';
import { useContext } from 'react';

export interface PiyingGroupProps {}
export function RestGroup(_: PiyingGroupProps) {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  const fixedChildren = useSignalToRef(field, (field) => field?.fixedChildren!())!;
  const restChildren = useSignalToRef(field, (field) => field?.restChildren!())!;
  return (
    <>
      <div className="fields">
        {fixedChildren.map((field, index) => {
          return (
            <PiyingFieldTemplate
              field={field}
              key={index}
            ></PiyingFieldTemplate>
          );
        })}
      </div>
      <div className="rest-fields">
        {restChildren.map((field, index) => {
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
