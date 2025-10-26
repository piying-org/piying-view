import * as v from 'valibot';
import { NumberTypeService } from './number.service';
export class IntegerTypeService extends NumberTypeService {
  override readonly name = 'integer';

  override getBaseDefine() {
    return v.number();
  }
  override getExtraActionList() {
    return [v.integer()];
  }
}
