import {
  Directive,
  ElementRef,
  inject,
  input,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[attributes]',
})
export class AttributesDirective {
  attributes = input.required<Record<string, any>>();
  excludes = input<string[]>([]);
  #rederer = inject(Renderer2);
  #el = inject(ElementRef).nativeElement;
  ngOnChanges(changes: SimpleChanges): void {
    const { previousValue, currentValue, firstChange } = changes['attributes'];
    for (const key in currentValue) {
      if (this.excludes().includes(key)) {
        continue;
      }
      this.#rederer.setAttribute(this.#el, key, currentValue[key]);
    }
    if (!firstChange) {
      for (const key in previousValue) {
        if (this.excludes().includes(key)) {
          continue;
        }
        if (!(key in currentValue)) {
          this.#rederer.removeAttribute(this.#el, key);
        }
      }
    }
  }
}
