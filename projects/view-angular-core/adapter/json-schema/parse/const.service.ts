import { BaseAction, OptionJSType, ResolvedSchema } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class ConstTypeService extends BaseTypeService {
  override readonly name: OptionJSType = 'const';

  override parseBase(actionList: BaseAction[]): ResolvedSchema {
    const value = this.schema.const!;
    const Define = v.pipe(
      v.literal(value as any),
      ...this.getAllActionList(actionList),
    );
    return Define;
  }
}
