import {
  asControl,
  patchInputs,
  setComponent,
} from '@piying/view-angular-core';
import { BaseAction, ListType, ResolvedSchema } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class ListTypeService extends BaseTypeService {
  override readonly name = '__fixedList';

  override parseBase(actionList: BaseAction[]): ResolvedSchema {
    const context: ListType = (this.schema as any)['data'];
    const options = context.options.flat();
    const define = v.picklist(options.map((option) => option.value));
    if (context.multi) {
      return v.pipe(
        v.array(define),
        patchInputs({ options: options }),
        asControl(),
        setComponent(
          context.uniqueItems ? 'multiselect' : 'multiselect-repeat',
        ),
        ...actionList,
      );
    } else {
      return v.pipe(define, patchInputs({ options: options }), ...actionList);
    }
  }
}
