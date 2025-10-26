import { patchInputs } from '@piying/view-angular-core';
import { BaseAction, ListType, ResolvedSchema } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class ListTypeService extends BaseTypeService {
  override readonly name = '__fixedList' as any;

  override parse(actionList: BaseAction[]): ResolvedSchema {
    const context: ListType = (this.schema as any)['data'] ?? this.getData();
    const define = v.pipe(
      v.picklist(context.options.flat().map((option) => option.value)),
      patchInputs({ options: context.options }),
    );
    if (context.multi) {
      return v.array(define);
    } else {
      return define;
    }
  }
}
