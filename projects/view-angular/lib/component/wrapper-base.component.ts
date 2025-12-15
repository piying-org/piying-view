import {
  computed,
  Directive,
  inject,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

import { BaseComponent } from './base.component';
import {
  PI_COMPONENT_LIST,
  PI_COMPONENT_LIST_LISTEN,
  PI_VIEW_FIELD_TOKEN,
} from '../type/view-token';
import { DynamicComponentConfig } from '../type/component';
/** @deprecated use InsertFieldDirective for ng-container*/
@Directive()
export class PiyingViewWrapperBase extends BaseComponent {
  fieldComponentAnchor = viewChild('fieldComponent', {
    read: ViewContainerRef,
  });
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  #listen = inject(PI_COMPONENT_LIST_LISTEN);
  #list = inject(PI_COMPONENT_LIST);
  override createComponent(
    list?: DynamicComponentConfig[],
    viewContainerRef?: ViewContainerRef,
  ) {
    let anchor = viewContainerRef ?? this.fieldComponentAnchor()!;
    if (!anchor) {
      return;
    }
    const result = super.createComponent(
      list ?? this.#list,
      viewContainerRef ?? this.fieldComponentAnchor()!,
    );
    this.#listen.subscribe((list) => {
      this.update(list);
    });
    return result;
  }
  ngOnInit(): void {
    this.createComponent();
  }
}
