import { BaseAction, OptionJSType, ResolvedSchema } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class NullTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'number';

  override parseBase(actionList: BaseAction[]): ResolvedSchema {
    const Define = v.pipe(
      v.optional(v.null(), null),
      ...this.getAllActionList(actionList),
    );
    return Define;
  }
}
