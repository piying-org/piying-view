import { patchInputs } from '../../../convert';
import { BaseAction, ListType, ResolvedSchema } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class ListTypeService extends BaseTypeService {
  override readonly name = 'fixedList';

  override parse(actionList: BaseAction[]): ResolvedSchema {
    const context = this.getData() as ListType;
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
