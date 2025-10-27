import { OptionJSType } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class NumberTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'number';

  override getBaseDefine() {
    return v.number();
  }
}
