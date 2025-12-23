import { Directive, inject, ViewContainerRef } from '@angular/core';
import { PI_COMPONENT_LIST_LISTEN, PI_COMPONENT_LIST } from '../type';
import { DynamicComponentConfig } from '../type/component';
import { BaseComponent } from './base.component';

@Directive({
  selector: '[insertField]',
  exportAs: 'insertField',
})
export class InsertFieldDirective extends BaseComponent {
  #viewContainerRef = inject(ViewContainerRef);
  #listen = inject(PI_COMPONENT_LIST_LISTEN);
  #list = inject(PI_COMPONENT_LIST);
  override createComponent(
    list?: DynamicComponentConfig[],
    viewContainerRef?: ViewContainerRef,
  ) {
    const result = super.createComponent(
      list ?? this.#list,
      this.#viewContainerRef,
    );
    this.#listen.subscribe((list) => {
      this.update(list);
    });
    return result;
  }

  constructor() {
    super();
    this.createComponent();
  }
}
