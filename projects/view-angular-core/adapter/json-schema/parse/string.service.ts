import { OptionJSType } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class StringTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'string';

  override getBaseDefine() {
    return v.string();
  }
}
