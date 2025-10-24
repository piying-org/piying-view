import { reflectComponentType, Type } from '@angular/core';
export function isComponentType(input: any): input is Type<any> {
  return !!reflectComponentType(input as any);
}
