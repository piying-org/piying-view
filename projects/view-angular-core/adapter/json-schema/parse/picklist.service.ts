import { OptionJSType } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
import { patchInputs } from '@piying/view-angular-core';
import { toFixedList } from '../../util/to-fixed-list';

export class PicklistTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'picklist' as any;

  override getBaseDefine() {
    return v.pipe(
      v.picklist(this.schema.enum as any),
      patchInputs({
        options: toFixedList(this.schema.enum!),
      }),
    );
  }
}
