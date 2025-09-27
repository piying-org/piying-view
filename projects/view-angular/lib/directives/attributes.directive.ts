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
})
export class AttributesDirective {
  a = input.required<Record<string, any>>();
  #rederer = inject(Renderer2);
  #el = inject(ElementRef).nativeElement;
  ngOnChanges(changes: SimpleChanges): void {
    const { previousValue, currentValue, firstChange } = changes['a'];
    for (const key in currentValue) {
      this.#rederer.setAttribute(this.#el, key, currentValue[key]);
    }
    if (!firstChange) {
      for (const key in previousValue) {
        if (!(key in currentValue)) {
          this.#rederer.removeAttribute(this.#el, key);
        }
      }
    }
  }
}
