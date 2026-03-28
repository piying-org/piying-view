import { Injector, Pipe, PipeTransform } from '@angular/core';
import {
  PI_VIEW_COMPONENT_LIST_TOKEN,
} from '../type';

@Pipe({ name: 'listInjector' })
export class ListInjectorPipe implements PipeTransform {
  transform(injector: Injector) {
    return Injector.create({
      providers: [{ provide: PI_VIEW_COMPONENT_LIST_TOKEN, useValue: [] }],
      parent: injector,
    });
  }
}
