import { OptionJSType } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class BooleanTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'boolean';

  override getBaseDefine() {
    return v.boolean();
  }
}
