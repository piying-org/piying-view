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

  override parse(actionList: BaseAction[]): ResolvedSchema {
    const context: ListType = (this.schema as any)['data'];
    const define = v.picklist(
      context.options.flat().map((option) => option.value),
    );
    if (context.multi) {
      return v.pipe(
        v.array(define),
        patchInputs({ options: context.options }),
        asControl(),
        setComponent(
          context.uniqueItems ? 'multiselect' : 'multiselect-repeat',
        ),
      );
    } else {
      return v.pipe(define, patchInputs({ options: context.options }));
    }
  }
}
