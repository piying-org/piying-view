import { useContext } from 'react';
import { PiyingFieldTemplate } from './field-template';
import { PI_VIEW_FIELD_TOKEN } from '../token';
import { useSignalToRef } from '../util';

export function PiyingGroup() {
  const field = useContext(PI_VIEW_FIELD_TOKEN);
  const children = useSignalToRef(field, (field) => field?.children!())!;
  return (
    <>
      {children.map((field, index) => {
        return (
          <PiyingFieldTemplate field={field} key={index}></PiyingFieldTemplate>
        );
      })}
    </>
  );
}
