import { BaseAction, ResolvedSchema } from '../type';
import { BaseTypeService } from './base.service';
import * as v from 'valibot';
export class ListTypeService extends BaseTypeService {
  override readonly name = 'fixedList';
  // todo

  override parse(actionList: BaseAction[]): ResolvedSchema {
    const context = this.getData();
    if (context['enum']) {
      return v.picklist(context['enum']);
    } else if (context['type'] === 'array') {
      return v.array(v.picklist(context['items']['enum']));
    }
    throw new Error('');
  }
}
