import { Injector, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { PI_VIEW_FIELD_TEMPLATE_REF_TOKEN } from '../type';

@Pipe({ name: 'templateInjector' })
export class TemplatePipe implements PipeTransform {
  transform(injector: Injector, templateRef: TemplateRef<any>) {
    return Injector.create({
      providers: [
        { provide: PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, useValue: templateRef },
      ],
      parent: injector,
    });
  }
}
