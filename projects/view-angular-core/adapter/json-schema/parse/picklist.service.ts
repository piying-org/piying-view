import { OptionJSType } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class PicklistTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'picklist' as any;

  override getBaseDefine() {
    return v.picklist(this.schema.enum as any);
  }
}
