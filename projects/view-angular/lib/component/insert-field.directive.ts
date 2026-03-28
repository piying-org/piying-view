import {
  Directive,
  inject,
  input,
  SimpleChange,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { PI_COMPONENT_LIST_LISTEN, PI_COMPONENT_LIST } from '../type';
import { DynamicComponentConfig } from '../type/component';
import { BaseComponent } from './base.component';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';

@Directive({
  selector: '[insertField]',
  exportAs: 'insertField',
})
export class InsertFieldDirective extends BaseComponent {
  insertFieldSlots = input<Record<string, TemplateRef<any>>>();
  #viewContainerRef = inject(ViewContainerRef);
  #listen = inject(PI_COMPONENT_LIST_LISTEN);
  #list = inject(PI_COMPONENT_LIST);
  #field = inject(PI_VIEW_FIELD_TOKEN);
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
  ngOnChanges(changes: Record<keyof InsertFieldDirective, SimpleChange>): void {
    if (changes.insertFieldSlots) {
      this.#field().slots.update((slots) => ({
        ...slots,
        ...this.insertFieldSlots(),
      }));
    }
  }
  ngOnInit(): void {
    this.createComponent();
  }
  ngOnDestroy(): void {
    if (
      this.componentRef &&
      (this.componentRef.componentType as any).__version === 2
    ) {
      this.componentRef.destroy();
    }
  }
}
