import { Component, computed, forwardRef, input } from '@angular/core';
import { BaseControl } from '../form/base.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
export interface Option1 {
  label: string;
  value: string;
  disabled?: boolean;
}
export type Option2 = string;
@Component({
  selector: 'div[type=dropdown]',
  templateUrl: './component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent extends BaseControl {
  options = input<Option1[], Option1[] | Option2[]>([], {
    transform: (input) => {
      if (typeof input?.[0] === 'string') {
        return input.map((item) => ({ label: item, value: item }));
      }
      return input as any;
    },
  });
  selected$$ = computed(() => {
    const list = this.options().find((item) => item.value === this.value$());
    return list?.label ?? '';
  });
  optionSelected(option: Option1, el: HTMLElement) {
    this.valueChange(option.value);
    el.blur();
  }
}
