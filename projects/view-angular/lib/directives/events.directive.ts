import { Directive, ElementRef, inject, input, Renderer2 } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[events]',
})
export class EventsDirective {
  events = input.required<Record<string, (event: any) => any>>();
  #renderer = inject(Renderer2);
  #el = inject(ElementRef).nativeElement;
  #cleanList: (() => void)[] = [];
  ngOnChanges(): void {
    this.#clean();
    this.#cleanList = [];
    for (const key in this.events()) {
      const event = this.events()[key];
      this.#cleanList.push(this.#renderer.listen(this.#el, key, event));
    }
  }
  #clean() {
    this.#cleanList.forEach((fn) => fn());
  }
  ngOnDestroy(): void {
    this.#clean();
  }
}
